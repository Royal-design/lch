"use client"

import { apiRequest } from "@/lib/api-client"
import { supabase } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type AuthProfile = {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  status: "active" | "suspended"
  avatar_url: string | null
  created_at?: string
  updated_at?: string
}

type ProfileResponse = {
  user: User | null
  profile: AuthProfile | null
}

interface AuthState {
  user: User | null
  profile: AuthProfile | null
  role: string | null
  loading: boolean
  initialized: boolean
  authListenerStarted: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: AuthProfile | null) => void
  setRole: (role: string | null) => void
  setLoading: (loading: boolean) => void
  initAuth: () => Promise<void>
  refreshAuth: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  profile: null,
  role: null,
  loading: true,
  initialized: false,
  authListenerStarted: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile, role: profile?.role ?? null }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),

  initAuth: async () => {
    try {
      await get().refreshAuth()

      if (get().authListenerStarted) return

      set({ authListenerStarted: true })

      supabase.auth.onAuthStateChange((event, session) => {
        const nextUser = session?.user ?? null
        const currentUser = get().user

        if (event === "SIGNED_OUT" || !nextUser) {
          set({
            user: null,
            profile: null,
            role: null,
            initialized: true,
            loading: false,
          })
          return
        }

        if (currentUser?.id === nextUser.id) {
          set({
            user: nextUser,
            initialized: true,
            loading: false,
          })
          return
        }

        set({
          user: nextUser,
          profile: null,
          role: null,
          initialized: true,
          loading: Boolean(nextUser),
        })

        if (nextUser) {
          fetchProfile(nextUser.id).then((nextProfile) => {
            set({
              profile: nextProfile,
              role: nextProfile?.role ?? "user",
              loading: false,
            })
          })
        }
      })
    } catch (error) {
      console.error("Auth init error:", error)
      set({
        user: null,
        profile: null,
        role: null,
        initialized: true,
        loading: false,
      })
    }
  },

  refreshAuth: async () => {
    const current = get()

    if (!current.initialized && !current.user) {
      set({ loading: true })
    }

    try {
      const data = await apiRequest<ProfileResponse>("/api/auth/me")

      if (data.profile?.status === "suspended") {
        set({
          user: null,
          profile: null,
          role: null,
          initialized: true,
          loading: false,
        })
        return
      }

      set({
        user: data.user,
        profile: data.profile,
        role: data.profile?.role ?? null,
        initialized: true,
        loading: false,
      })
      return
    } catch {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const user = session?.user ?? null
      const profile = user ? await fetchProfile(user.id) : null

      set({
        user,
        profile,
        role: profile?.role ?? null,
        initialized: true,
        loading: false,
      })
    }
  },

  signOut: async () => {
    await apiRequest("/api/auth/logout", {
      method: "POST",
    }).catch(() => null)
    await supabase.auth.signOut().catch(() => null)
    set({
      user: null,
      profile: null,
      role: null,
      initialized: true,
      loading: false,
    })
    window.location.assign("/login")
  },
}),
    {
      name: "lch-auth-profile",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        role: state.role,
      }),
    }
  )
)

async function fetchProfile(userId: string): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, status, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}
