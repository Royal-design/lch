"use client"

import { Save } from "lucide-react"
import { toast } from "sonner"

import { AdminPageHeader } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const settings = [
  ["Minimum contribution", "NGN 500"],
  ["Default lock duration", "6 months"],
  ["Withdrawal review SLA", "24 hours"],
  ["Risk alert threshold", "NGN 2,000,000"],
]

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        eyebrow="Settings"
        title="Platform configuration"
        description="Configure contribution rules, lock duration defaults, notifications, and future admin roles."
      />
      <Card className="fintech-surface rounded-[1.35rem]">
        <CardHeader>
          <CardTitle>Rules and controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map(([label, value]) => (
            <label key={label} className="grid gap-2">
              <span className="text-sm font-semibold">{label}</span>
              <Input defaultValue={value} className="h-11 rounded-xl" />
            </label>
          ))}
          <Button className="h-11 rounded-xl" onClick={() => toast.success("Settings saved locally.")}>
            <Save className="size-4" />
            Save settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
