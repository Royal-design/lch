"use client"

import { supabase } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { create } from "zustand"

type ProfileResponse = {
  user: User | null
  profile: {
    role: "user" | "admin"
    status: "active" | "suspended"
  } | null
}

interface AuthState {
  user: User | null
  role: "user" | "admin" | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setRole: (role: "user" | "admin" | null) => void
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

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),

  initAuth: async () => {
    try {
      await get().refreshAuth()

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        const nextUser = session?.user ?? null

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
    set({ loading: true })

    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      })

      if (response.ok) {
        const data = (await response.json()) as ProfileResponse

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
      }

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
    } catch (error) {
      console.error("Auth refresh error:", error)
      set({
        user: null,
        role: null,
        initialized: true,
        loading: false,
      })
    }
  },

  signOut: async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => null)
    await supabase.auth.signOut().catch(() => null)
    set({ user: null, role: null, initialized: true, loading: false })
    window.location.assign("/login")
  },
}))

async function fetchProfileRole(userId: string): Promise<"user" | "admin"> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()

  if (error || data?.role !== "admin") {
    return "user"
  }

  return "admin"
}
