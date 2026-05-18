import { CalendarClock, LockKeyhole, Plus, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const plans = [
  ["Family Ajo Circle", "NGN 420,000", "NGN 600,000", "70%", "6 months"],
  ["Rent Savings", "NGN 275,000", "NGN 800,000", "34%", "10 months"],
  ["Business Capital", "NGN 150,000", "NGN 500,000", "30%", "4 months"],
]

export default function ContributionsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Contribution plans
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Savings goals
          </h1>
        </div>
        <Button className="h-10 rounded-lg sm:w-auto">
          <Plus className="size-4" />
          New plan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map(([title, saved, target, progress, duration]) => (
          <Card key={title} className="fintech-surface rounded-lg">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center justify-between gap-3">
                <span>{title}</span>
                <span className="grid size-8 place-items-center rounded-md bg-accent text-primary">
                  <LockKeyhole className="size-4" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between text-sm">
                <p className="text-xl font-semibold">{saved}</p>
                <p className="text-muted-foreground">{target}</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: progress }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="size-3.5" />
                  Locked for {duration}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  <TrendingUp className="size-3.5" />
                  {progress}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
