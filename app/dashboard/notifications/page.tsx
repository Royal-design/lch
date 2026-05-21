"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { SkeletonBlock } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"

type NotificationRecord = {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

type NotificationsResponse = {
  notifications: NotificationRecord[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

async function fetchNotifications(page: number) {
  return apiRequest<NotificationsResponse>(
    `/api/notifications?page=${page}&pageSize=20`
  )
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => fetchNotifications(page),
  })
  const markReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ read: true }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("Notifications marked as read.")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to update notifications"
      )
    },
  })
  const notifications = data?.notifications ?? []
  const pagination = data?.pagination

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Notifications
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Money updates
          </h1>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          disabled={
            markReadMutation.isPending ||
            notifications.every((notification) => notification.read)
          }
          onClick={() => markReadMutation.mutate()}
        >
          Mark all read
        </Button>
      </div>

      <Card className="fintech-surface rounded-[1.35rem]">
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20 rounded-2xl" />
            ))
          ) : notifications.length === 0 ? (
            <p className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            notifications.map((notification) => {
              const Icon = notification.read ? CheckCircle2 : Bell

              return (
              <div
                key={notification.id}
                className="flex gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 transition-colors hover:border-primary/20 hover:bg-card"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{notification.title}</p>
                    {!notification.read ? (
                      <span className="status-pill">New</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
              </div>
              )
            })
          )}
          {pagination && pagination.totalPages > 1 ? (
            <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} -{" "}
                {pagination.total.toLocaleString("en-NG")} notifications
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(current + 1, pagination.totalPages)
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
