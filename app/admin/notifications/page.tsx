"use client"

import { Send } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import {
  AdminDataTable,
  AdminPageHeader,
  AdminTableSkeleton,
} from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiRequest } from "@/lib/api-client"

type AdminNotification = {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

type AdminNotificationsResponse = {
  notifications: AdminNotification[]
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

async function fetchAdminNotifications(page: number) {
  return apiRequest<AdminNotificationsResponse>(
    `/api/admin/notifications?page=${page}&pageSize=10`
  )
}

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ["admin-notifications", page],
    queryFn: () => fetchAdminNotifications(page),
  })
  const [message, setMessage] = useState("")
  const [sendEmail, setSendEmail] = useState(true)
  const broadcastMutation = useMutation({
    mutationFn: () =>
      apiRequest<{ notified: number; emailed: number }>(
        "/api/admin/notifications",
        {
          method: "POST",
          body: JSON.stringify({
            title: "LCH announcement",
            message,
            email: sendEmail,
          }),
        }
      ),
    onSuccess: (response) => {
      toast.success(
        `Broadcast sent to ${response.notified.toLocaleString("en-NG")} users.`
      )
      setMessage("")
      setPage(1)
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] })
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to send broadcast"
      )
    },
  })

  if (isLoading || !data) return <AdminTableSkeleton rows={8} columns={4} />

  const canSend = message.trim().length >= 3 && !broadcastMutation.isPending
  const rows = data.notifications.map((notification) => [
    notification.title,
    notification.message,
    notification.read ? "Delivered" : "Unread",
    formatDate(notification.created_at),
  ])
  const { pagination } = data

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Notifications"
        title="System messaging center"
        description="Send announcements, user notifications, and risk alerts with delivery visibility."
      />
      <Card className="fintech-surface rounded-[1.35rem]">
        <CardHeader>
          <CardTitle>Send broadcast</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 lg:grid-cols-[1fr_auto_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              if (canSend) broadcastMutation.mutate()
            }}
          >
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a concise admin message"
              className="h-11 rounded-xl"
              maxLength={500}
            />
            <label className="flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(event) => setSendEmail(event.target.checked)}
                className="size-4 accent-primary"
              />
              Email users
            </label>
            <Button className="h-11 rounded-xl" disabled={!canSend}>
              <Send className="size-4" />
              {broadcastMutation.isPending ? "Sending..." : "Send notification"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <AdminDataTable
        title="Message history"
        columns={["Type", "Message", "Delivery Status", "Date"]}
        rows={rows}
        statusIndex={2}
        footer={
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
        }
      />
    </div>
  )
}
