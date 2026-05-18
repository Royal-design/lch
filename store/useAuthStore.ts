"use client"

import { supabase } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { create } from "zustand"

interface AuthState {
  user: User | null
  role: "user" | "admin" | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setRole: (role: "user" | "admin" | null) => void
  setLoading: (loading: boolean) => void
  initAuth: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),

  initAuth: async () => {
    try {
      // Get initial session
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

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, role: null })
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
