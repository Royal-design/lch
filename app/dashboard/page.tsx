"use client"

import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Landmark,
  Plus,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const transactions = [
  {
    title: "Monthly contribution",
    amount: "+₦50,000",
    status: "Successful",
    time: "Today, 9:24 AM",
    type: "in",
  },
  {
    title: "Locked savings transfer",
    amount: "₦120,000",
    status: "Locked",
    time: "Yesterday, 6:12 PM",
    type: "lock",
  },
  {
    title: "Wallet withdrawal",
    amount: "-₦18,500",
    status: "Processing",
    time: "May 16, 2026",
    type: "out",
  },
]

const plans = [
  {
    title: "Family Ajo Circle",
    saved: 420000,
    target: 600000,
    duration: "6 months lock",
  },
  {
    title: "Rent Savings",
    saved: 275000,
    target: 800000,
    duration: "10 months lock",
  },
]

const quickActions = [
  { icon: Landmark, label: "Create plan" },
  { icon: Plus, label: "Add contribution" },
  { icon: Wallet, label: "Withdraw funds" },
  { icon: ReceiptText, label: "Transactions" },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true)

  return (
    <div className="mx-auto grid max-w-7xl gap-5">
      <section className="grid gap-5 lg:grid-cols-[1.45fr_0.9fr]">
        <Card className="overflow-hidden rounded-3xl border-primary/15 bg-primary text-primary-foreground shadow-lg shadow-emerald-950/10 dark:shadow-black/30">
          <CardContent className="relative p-6 sm:p-7">
            <div className="absolute right-0 top-0 size-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-primary-foreground/75">
                  Total Balance
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {showBalance ? "₦842,500.00" : "••••••••"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-primary-foreground hover:bg-white/12 hover:text-primary-foreground"
                    onClick={() => setShowBalance((value) => !value)}
                  >
                    {showBalance ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                    <span className="sr-only">Toggle balance visibility</span>
                  </Button>
                </div>
              </div>
              <Wallet className="size-7 opacity-80" />
            </div>

            <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Locked Savings", "₦320,000"],
                ["Active Contributions", "4 plans"],
                ["Available Wallet", "₦522,500"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-xs text-primary-foreground/70">{label}</p>
                  <p className="mt-2 font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="h-11 rounded-2xl bg-white text-emerald-800 hover:bg-white/90"
              >
                <ArrowDownLeft className="size-4" />
                Deposit
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-white/20 bg-white/10 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
              >
                <ArrowUpRight className="size-4" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="fintech-surface rounded-3xl">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map(({ icon: Icon, label }) => (
              <Button
                key={label}
                variant="outline"
                className="h-24 flex-col rounded-2xl bg-background/60 text-center hover:bg-accent"
              >
                <Icon className="size-5 text-primary" />
                <span className="text-xs font-semibold">{label}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Card className="fintech-surface rounded-3xl">
          <CardHeader>
            <CardTitle>Contribution plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.map((plan) => {
              const progress = Math.round((plan.saved / plan.target) * 100)

              return (
                <div
                  key={plan.title}
                  className="rounded-3xl border border-border bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{plan.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {plan.duration}
                      </p>
                    </div>
                    <ShieldCheck className="size-5 text-primary" />
                  </div>
                  <div className="mt-4 flex items-end justify-between text-sm">
                    <p className="font-bold">{formatCurrency(plan.saved)}</p>
                    <p className="text-muted-foreground">
                      {formatCurrency(plan.target)}
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="fintech-surface rounded-3xl">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.title}
                className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                    {transaction.type === "out" ? (
                      <ArrowUpRight className="size-4" />
                    ) : (
                      <ArrowDownLeft className="size-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{transaction.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{transaction.amount}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
