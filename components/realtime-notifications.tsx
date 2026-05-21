"use client"

import { supabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "sonner"

type NotificationPayload = {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
  user_id: string
}

export function RealtimeNotifications() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as NotificationPayload

          toast(notification.title, {
            description: notification.message,
          })

          queryClient.invalidateQueries({ queryKey: ["notifications"] })
          queryClient.invalidateQueries({ queryKey: ["admin-notifications"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, user?.id])

  return null
}
