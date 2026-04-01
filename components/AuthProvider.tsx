"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { useEffect } from "react"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return <>{children}</>
}
