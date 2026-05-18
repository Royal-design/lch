import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const rows = [
  ["Monthly contribution", "+₦50,000", "Successful", "Today, 9:24 AM", "in"],
  ["Wallet withdrawal", "-₦18,500", "Processing", "Yesterday, 6:12 PM", "out"],
  ["Locked savings transfer", "₦120,000", "Locked", "May 16, 2026", "in"],
  ["Ajo contribution", "+₦25,000", "Successful", "May 15, 2026", "in"],
]

export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Transaction tracking</p>
        <h1 className="text-2xl font-bold tracking-tight">Activity ledger</h1>
      </div>
      <Card className="fintech-surface rounded-3xl">
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map(([title, amount, status, time, type]) => (
            <div key={`${title}-${time}`} className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  {type === "out" ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{amount}</p>
                <p className="text-xs text-muted-foreground">{status}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
