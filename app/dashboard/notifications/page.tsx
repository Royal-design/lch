import { Bell, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const notifications = [
  ["Contribution received", "Your Family Ajo Circle contribution was recorded.", "2 min ago"],
  ["Savings locked", "Rent Savings is protected until the selected maturity date.", "1 day ago"],
  ["Profile secured", "Two-factor security checks are ready for setup.", "3 days ago"],
]

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Notifications</p>
        <h1 className="text-2xl font-bold tracking-tight">Money updates</h1>
      </div>
      <Card className="fintech-surface rounded-3xl">
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map(([title, message, time], index) => (
            <div key={title} className="flex gap-3 rounded-2xl border border-border bg-background/60 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                {index === 0 ? <Bell className="size-4" /> : <CheckCircle2 className="size-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
