"use client"

import { apiRequest } from "@/lib/api-client"
import { supabase } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { create } from "zustand"

type ProfileResponse = {
  user: User | null
  profile: {
    role: string
    status: "active" | "suspended"
  } | null
}

interface AuthState {
  user: User | null
  role: string | null
  loading: boolean
  initialized: boolean
  authListenerStarted: boolean
  setUser: (user: User | null) => void
  setRole: (role: string | null) => void
  setLoading: (loading: boolean) => void
  initAuth: () => Promise<void>
  refreshAuth: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  loading: true,
  initialized: false,
  authListenerStarted: false,

  setUser: (user) => set({ user }),
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
          role: null,
          initialized: true,
          loading: Boolean(nextUser),
        })

        if (nextUser) {
          fetchProfileRole(nextUser.id).then((nextRole) => {
            set({
              role: nextRole,
              loading: false,
            })
          })
        }
      })
    } catch (error) {
      console.error("Auth init error:", error)
      set({
        user: null,
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
          role: null,
          initialized: true,
          loading: false,
        })
        return
      }

      set({
        user: data.user,
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
      const role = user ? await fetchProfileRole(user.id) : null

      set({
        user,
        role,
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
    set({ user: null, role: null, initialized: true, loading: false })
    window.location.assign("/login")
  },
}))

async function fetchProfileRole(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()

  if (error || !data?.role) {
    return "user"
  }

  return data.role
}
