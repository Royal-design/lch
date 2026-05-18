import { LockKeyhole, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const plans = [
  ["Family Ajo Circle", "₦420,000", "₦600,000", "70%", "6 months"],
  ["Rent Savings", "₦275,000", "₦800,000", "34%", "10 months"],
  ["Business Capital", "₦150,000", "₦500,000", "30%", "4 months"],
]

export default function ContributionsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Contribution plans</p>
          <h1 className="text-2xl font-bold tracking-tight">Savings goals</h1>
        </div>
        <Button className="rounded-2xl">
          <Plus className="size-4" />
          New plan
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map(([title, saved, target, progress, duration]) => (
          <Card key={title} className="fintech-surface rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {title}
                <LockKeyhole className="size-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between text-sm">
                <p className="text-xl font-bold">{saved}</p>
                <p className="text-muted-foreground">{target}</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: progress }} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Locked for {duration}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
