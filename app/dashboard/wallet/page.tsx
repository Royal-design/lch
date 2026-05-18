import { ArrowDownLeft, ArrowUpRight, Banknote, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WalletPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_0.75fr]">
      <Card className="rounded-3xl border-primary/15 bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <Wallet className="size-8 opacity-80" />
          <p className="mt-8 text-sm text-primary-foreground/75">
            Available wallet balance
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">₦522,500</h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" className="rounded-2xl bg-white text-emerald-800">
              <ArrowDownLeft className="size-4" />
              Deposit
            </Button>
            <Button variant="outline" className="rounded-2xl border-white/20 bg-white/10 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground">
              <ArrowUpRight className="size-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="fintech-surface rounded-3xl">
        <CardHeader>
          <CardTitle>Wallet details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Locked savings", "₦320,000"],
            ["Pending withdrawals", "₦18,500"],
            ["This month inflow", "₦250,000"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-center gap-3">
                <Banknote className="size-4 text-primary" />
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
