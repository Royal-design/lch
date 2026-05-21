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
  const role = useAuthStore((state) => state.role)
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

  useEffect(() => {
    if (!user?.id) return

    const refreshUserContributionViews = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] })
      queryClient.invalidateQueries({ queryKey: ["contribution-plans"] })
      queryClient.invalidateQueries({ queryKey: ["contributions"] })
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
    }

    const channel = supabase
      .channel(`user-contribution-sync-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contribution_plans",
          filter: `user_id=eq.${user.id}`,
        },
        refreshUserContributionViews
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        refreshUserContributionViews
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${user.id}`,
        },
        refreshUserContributionViews
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, user?.id])

  useEffect(() => {
    if (!user?.id || role !== "admin") return

    const refreshAdminContributionViews = () => {
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] })
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] })
      queryClient.invalidateQueries({ queryKey: ["admin-contributions"] })
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] })
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] })
      queryClient.invalidateQueries({ queryKey: ["admin-leaderboard"] })
    }

    const channel = supabase
      .channel("admin-contribution-sync")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contribution_plans",
        },
        refreshAdminContributionViews
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        refreshAdminContributionViews
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallets",
        },
        refreshAdminContributionViews
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, role, user?.id])

  return null
}
