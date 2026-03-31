"use client"

import { supabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useEffect } from "react"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { initAuth, setUser } = useAuthStore()

  useEffect(() => {
    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [initAuth, setUser])

  return <>{children}</>
}
