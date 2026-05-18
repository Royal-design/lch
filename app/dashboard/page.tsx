"use client"

import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Eye,
  EyeOff,
  Landmark,
  LockKeyhole,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const services = [
  { icon: Landmark, label: "Plans", caption: "4 active", tone: "blue" },
  { icon: Plus, label: "Fund wallet", caption: "Instant top up", tone: "green" },
  { icon: LockKeyhole, label: "Lock funds", caption: "Protected", tone: "violet" },
  { icon: ReceiptText, label: "Statement", caption: "PDF export", tone: "amber" },
]

const transactions = [
  ["Monthly contribution", "+NGN 50,000", "Successful", "Today, 9:24 AM", "in"],
  ["Locked savings transfer", "NGN 120,000", "Locked", "Yesterday, 6:12 PM", "lock"],
  ["Wallet withdrawal", "-NGN 18,500", "Processing", "May 16, 2026", "out"],
]

const insights = [
  { icon: ShieldCheck, label: "Protected funds", value: "NGN 320,000" },
  { icon: TrendingUp, label: "Monthly inflow", value: "+18.4%" },
  { icon: CalendarClock, label: "Next maturity", value: "Jun 24" },
]

function ServiceIcon({
  icon: Icon,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  tone: string
}) {
  return (
    <span
      className={cn(
        "relative grid size-12 place-items-center overflow-hidden rounded-[1.15rem] border shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover:-translate-y-0.5",
        tone === "blue" &&
          "border-sky-100 bg-sky-50 text-sky-700 dark:border-sky-400/15 dark:bg-sky-400/10 dark:text-sky-200",
        tone === "green" &&
          "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-200",
        tone === "violet" &&
          "border-violet-100 bg-violet-50 text-violet-700 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-200",
        tone === "amber" &&
          "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-200"
      )}
    >
      <span className="absolute inset-x-3 top-1 h-px rounded-full bg-white/80" />
      <Icon className="size-5" strokeWidth={2.2} />
    </span>
  )
}

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true)

  return (
    <div className="mx-auto grid max-w-7xl gap-5">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="overflow-hidden rounded-[1.25rem] border-border/80 bg-card shadow-[0_18px_50px_rgba(15,23,42,0.07)] dark:shadow-black/20">
          <CardContent className="p-0">
            <div className="border-b border-white/10 bg-[radial-gradient(circle_at_86%_12%,rgba(255,255,255,0.22),transparent_8rem),linear-gradient(135deg,var(--primary),oklch(0.27_0.045_245))] p-5 text-primary-foreground sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-primary-foreground/72">
                    Available balance
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      {showBalance ? "NGN 842,500.00" : "**********"}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
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
                <div className="flex gap-2">
                  <Button className="h-10 rounded-full bg-white px-4 text-slate-900 shadow-none hover:bg-white/90">
                    <ArrowDownLeft className="size-4" />
                    Deposit
                  </Button>
                  <Button className="h-10 rounded-full border border-white/20 bg-white/10 px-4 text-white shadow-none hover:bg-white/15">
                    <ArrowUpRight className="size-4" />
                    Withdraw
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["Wallet", "NGN 522,500"],
                  ["Locked", "NGN 320,000"],
                  ["Plans", "4 active"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur"
                  >
                    <p className="text-xs text-primary-foreground/68">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">
              {services.map(({ icon, label, caption, tone }) => (
                <button
                  key={label}
                  className="group flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.15rem] border border-border/80 bg-background/80 p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors hover:border-primary/25 hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25 dark:bg-background/45 dark:shadow-none"
                >
                  <ServiceIcon icon={icon} tone={tone} />
                  <span className="grid gap-1">
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-[0.7rem] font-medium text-muted-foreground">
                      {caption}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="fintech-surface rounded-xl">
          <CardHeader className="pb-1">
            <CardTitle>Financial health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="fintech-surface rounded-xl">
          <CardHeader className="pb-1">
            <CardTitle>Plan progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Family Ajo Circle", "70%", "NGN 420,000 of NGN 600,000"],
              ["Rent Savings", "34%", "NGN 275,000 of NGN 800,000"],
            ].map(([title, progress, caption]) => (
              <div key={title} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {caption}
                    </p>
                  </div>
                  <span className="status-pill">{progress}</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: progress }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="fintech-surface rounded-xl">
          <CardHeader className="grid grid-cols-[1fr_auto] items-center pb-1">
            <CardTitle>Recent activity</CardTitle>
            <Button variant="outline" size="icon" className="rounded-lg">
              <Search className="size-4" />
              <span className="sr-only">Search activity</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {transactions.map(([title, amount, status, time, type]) => {
              const Icon =
                type === "out" ? ArrowUpRight : type === "lock" ? LockKeyhole : ArrowDownLeft

              return (
                <div
                  key={`${title}-${time}`}
                  className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                      <Icon className="size-4" />
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
              )
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
