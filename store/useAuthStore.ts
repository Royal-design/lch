"use client"

import { supabase } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { create } from "zustand"

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  initAuth: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  initAuth: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      set({ user: session?.user ?? null })
    } catch (error) {
      console.error("Auth init error:", error)
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
    window.location.href = "/login"
  },
}))
