import { ArrowDownLeft, ArrowUpRight, Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const rows = [
  ["Monthly contribution", "+NGN 50,000", "Successful", "Today, 9:24 AM", "in"],
  ["Wallet withdrawal", "-NGN 18,500", "Processing", "Yesterday, 6:12 PM", "out"],
  ["Locked savings transfer", "NGN 120,000", "Locked", "May 16, 2026", "in"],
  ["Ajo contribution", "+NGN 25,000", "Successful", "May 15, 2026", "in"],
]

export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Transaction tracking
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Activity ledger
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-lg">
            <Search className="size-4" />
            <span className="sr-only">Search transactions</span>
          </Button>
          <Button variant="outline" className="h-10 rounded-lg">
            <Filter className="size-4" />
            Filter
          </Button>
        </div>
      </div>

      <Card className="fintech-surface rounded-lg">
        <CardHeader className="pb-1">
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.map(([title, amount, status, time, type]) => (
            <div
              key={`${title}-${time}`}
              className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-primary">
                  {type === "out" ? (
                    <ArrowUpRight className="size-4" />
                  ) : (
                    <ArrowDownLeft className="size-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{time}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end sm:text-right">
                <span className="status-pill">{status}</span>
                <p className="min-w-28 text-sm font-semibold">{amount}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
