"use client"

import { supabase } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { create } from "zustand"

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  initAuth: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  initAuth: async () => {
    try {
      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      set({
        user: session?.user ?? null,
        initialized: true,
        loading: false,
      })

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          initialized: true,
          loading: false,
        })
      })
    } catch (error) {
      console.error("Auth init error:", error)
      set({
        user: null,
        initialized: true,
        loading: false,
      })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
    window.location.href = "/login"
  },
}))
