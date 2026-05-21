"use client"

import { Send } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { getAdminData } from "@/components/admin/admin-data"
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiRequest } from "@/lib/api-client"

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ["admin-notifications"], queryFn: getAdminData })
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
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] })
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to send broadcast"
      )
    },
  })

  if (!data) return null

  const canSend = message.trim().length >= 3 && !broadcastMutation.isPending

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
        rows={data.notifications}
        statusIndex={2}
      />
    </div>
  )
}
