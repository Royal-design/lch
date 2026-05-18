import { Bell, CheckCircle2, ShieldCheck } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const notifications = [
  ["Contribution received", "Your Family Ajo Circle contribution was recorded.", "2 min ago", "new"],
  ["Savings locked", "Rent Savings is protected until the selected maturity date.", "1 day ago", "done"],
  ["Profile secured", "Two-factor security checks are ready for setup.", "3 days ago", "secure"],
]

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Notifications
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Money updates
        </h1>
      </div>

      <Card className="fintech-surface rounded-lg">
        <CardHeader className="pb-1">
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.map(([title, message, time, type]) => {
            const Icon =
              type === "new" ? Bell : type === "secure" ? ShieldCheck : CheckCircle2

            return (
              <div
                key={title}
                className="flex gap-3 rounded-lg border border-border bg-background p-4"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{title}</p>
                    {type === "new" ? (
                      <span className="status-pill">New</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{time}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
