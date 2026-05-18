import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Landmark,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const walletStats = [
  { icon: Landmark, label: "Locked savings", value: "NGN 320,000" },
  { icon: CreditCard, label: "Pending withdrawals", value: "NGN 18,500" },
  { icon: Banknote, label: "This month inflow", value: "NGN 250,000" },
]

export default function WalletPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_0.75fr]">
      <Card className="fintech-surface rounded-lg">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Wallet className="size-3.5 text-primary" />
                Available balance
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                NGN 522,500
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Funds available for withdrawal or new contribution plans.
              </p>
            </div>
            <div className="hidden size-12 place-items-center rounded-lg bg-accent text-primary sm:grid">
              <Wallet className="size-6" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button className="h-10 rounded-lg">
              <ArrowDownLeft className="size-4" />
              Deposit
            </Button>
            <Button variant="outline" className="h-10 rounded-lg">
              <ArrowUpRight className="size-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="fintech-surface rounded-lg">
        <CardHeader className="pb-1">
          <CardTitle>Wallet details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {walletStats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-md bg-accent text-primary">
                  <Icon className="size-4" />
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
