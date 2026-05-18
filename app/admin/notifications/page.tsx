"use client"

import { Send } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { getAdminData } from "@/components/admin/admin-data"
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function AdminNotificationsPage() {
  const { data } = useQuery({ queryKey: ["admin-notifications"], queryFn: getAdminData })

  if (!data) return null

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
        <CardContent className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input placeholder="Write a concise admin message" className="h-11 rounded-xl" />
          <Button className="h-11 rounded-xl" onClick={() => toast.success("Notification queued.")}>
            <Send className="size-4" />
            Send notification
          </Button>
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
