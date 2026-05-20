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
  Wallet,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { AppLoadingScreen } from "@/components/app-loading-screen"
import { CreateContributionPlanForm } from "@/components/forms/create-contribution-plan-form"
import { DepositForm } from "@/components/forms/deposit-form"
import { FormModal } from "@/components/forms/form-system"
import { StatementRequestForm } from "@/components/forms/statement-request-form"
import { WithdrawalRequestForm } from "@/components/forms/withdrawal-request-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiRequest } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type DashboardPlan = {
  id: string
  title: string
  target_amount: number | string
  saved_amount: number | string
  lock_duration: string
  status: string
  created_at: string
}

type DashboardTransaction = {
  id: string
  type: string
  amount: number | string
  status: string
  reference: string
  description: string | null
  created_at: string
}

type DashboardData = {
  wallet: {
    balance: number | string
    locked_balance: number | string
  }
  plans: DashboardPlan[]
  transactions: DashboardTransaction[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

function formatCurrencyWithSign(amount: number, type: string) {
  const sign = type === "withdrawal" ? "-" : "+"
  return `${sign}${formatCurrency(amount)}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function titleForTransaction(transaction: DashboardTransaction) {
  if (transaction.description) return transaction.description

  const labels: Record<string, string> = {
    deposit: "Wallet top up",
    withdrawal: "Wallet withdrawal",
    contribution: "Contribution payment",
    lock: "Locked savings transfer",
    unlock: "Unlocked savings",
    adjustment: "Wallet adjustment",
  }

  return labels[transaction.type] || "Account activity"
}

function monthsFromLockDuration(value: string) {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : 0
}

function getMaturityDate(plan: DashboardPlan) {
  const months = monthsFromLockDuration(plan.lock_duration)
  if (!months) return null

  const date = new Date(plan.created_at)
  date.setMonth(date.getMonth() + months)
  return date
}

async function fetchDashboardData() {
  return apiRequest<DashboardData>("/api/dashboard")
}

function ToneIcon({
  icon: Icon,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  tone: string
}) {
  return (
    <span
      className={cn(
        "grid size-11 place-items-center rounded-2xl border transition-all duration-200 group-hover:-translate-y-0.5",
        tone === "green" &&
          "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-200",
        tone === "slate" &&
          "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
        tone === "blue" &&
          "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-400/15 dark:bg-sky-400/10 dark:text-sky-200",
        tone === "amber" &&
          "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-200"
      )}
    >
      <Icon className="size-5" strokeWidth={2.2} />
    </span>
  )
}

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [activityQuery, setActivityQuery] = useState("")
  const [activityStatus, setActivityStatus] = useState("all")
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: fetchDashboardData,
  })

  const dashboard = data ?? {
    wallet: { balance: 0, locked_balance: 0 },
    plans: [],
    transactions: [],
  }
  const walletBalance = Number(dashboard.wallet.balance) || 0
  const lockedBalance = Number(dashboard.wallet.locked_balance) || 0
  const planSavedTotal = dashboard.plans.reduce(
    (sum, plan) => sum + (Number(plan.saved_amount) || 0),
    0
  )
  const protectedFunds = lockedBalance + planSavedTotal
  const activePlans = dashboard.plans.filter((plan) => plan.status === "active")
  const monthlyInflow = dashboard.transactions
    .filter((transaction) => {
      const date = new Date(transaction.created_at)
      const now = new Date()
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear() &&
        ["deposit", "contribution"].includes(transaction.type)
      )
    })
    .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0)
  const now = new Date()
  const nextMaturity = dashboard.plans
    .map((plan) => ({ plan, date: getMaturityDate(plan) }))
    .filter((entry): entry is { plan: DashboardPlan; date: Date } =>
      Boolean(entry.date && entry.date >= now)
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0]
  const insights = [
    {
      icon: ShieldCheck,
      label: "Protected funds",
      value: formatCurrency(protectedFunds),
      caption: protectedFunds ? "Locked and plan savings" : "No locked funds yet",
    },
    {
      icon: TrendingUp,
      label: "Monthly inflow",
      value: formatCurrency(monthlyInflow),
      caption: "Recorded this month",
    },
    {
      icon: CalendarClock,
      label: "Next maturity",
      value: nextMaturity
        ? new Intl.DateTimeFormat("en-NG", {
            month: "short",
            day: "numeric",
          }).format(nextMaturity.date)
        : "Not set",
      caption: nextMaturity?.plan.title || "Create a locked plan",
    },
  ]
  const activityRows = dashboard.transactions.map((transaction) => {
    const amount = Number(transaction.amount) || 0
    const type =
      transaction.type === "withdrawal"
        ? "out"
        : transaction.type === "lock"
          ? "lock"
          : "in"

    return {
      id: transaction.id,
      title: titleForTransaction(transaction),
      amount: formatCurrencyWithSign(amount, transaction.type),
      status: transaction.status,
      time: formatDate(transaction.created_at),
      type,
    }
  })
  const filteredTransactions = activityRows.filter((transaction) => {
    const query = activityQuery.toLowerCase()
    const matchesQuery =
      `${transaction.title} ${transaction.amount} ${transaction.status} ${transaction.time}`
        .toLowerCase()
        .includes(query)
    const matchesStatus =
      activityStatus === "all" ||
      transaction.status.toLowerCase() === activityStatus

    return matchesQuery && matchesStatus
  })

  if (isLoading && !data) {
    return (
      <AppLoadingScreen
        title="Loading live dashboard"
        message="Pulling your wallet, contribution plans, and activity records."
      />
    )
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-5">
      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.85fr]">
        <Card className="overflow-hidden rounded-[1.6rem] border-0 bg-transparent p-0 shadow-none ring-0">
          <CardContent className="p-0">
            <div className="relative overflow-hidden rounded-[1.6rem] bg-[radial-gradient(circle_at_86%_8%,rgba(255,255,255,0.28),transparent_9rem),linear-gradient(135deg,oklch(0.34_0.09_158),oklch(0.22_0.045_245))] p-5 text-white shadow-[0_24px_70px_rgba(7,95,63,0.22)] sm:p-6 dark:shadow-black/35">
              <div className="absolute inset-x-6 top-0 h-px bg-white/35" />
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/78 backdrop-blur">
                    <Wallet className="size-3.5" />
                    Available balance
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <h2 className="text-[2.25rem] font-bold leading-none tracking-tight sm:text-5xl">
                      {showBalance ? formatCurrency(walletBalance) : "**********"}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-white hover:bg-white/10 hover:text-white"
                      onClick={() => setShowBalance((value) => !value)}
                    >
                      {showBalance ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      <span className="sr-only">Toggle balance visibility</span>
                    </Button>
                  </div>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/68">
                    Your wallet, locked savings, and active contribution plans in one protected view.
                  </p>
                </div>
                <div className="flex gap-2">
                  <FormModal
                    title="Deposit funds"
                    description="Validate a wallet top-up before payment integration."
                    trigger={
                      <Button className="h-11 rounded-full bg-white px-4 text-slate-950 shadow-none hover:bg-white/90">
                        <ArrowDownLeft className="size-4" />
                        Deposit
                      </Button>
                    }
                  >
                    <DepositForm framed={false} />
                  </FormModal>
                  <FormModal
                    title="Request withdrawal"
                    description="Check amount and reason before submitting a request."
                    trigger={
                      <Button className="h-11 rounded-full border border-white/20 bg-white/10 px-4 text-white shadow-none hover:bg-white/15">
                        <ArrowUpRight className="size-4" />
                        Withdraw
                      </Button>
                    }
                  >
                    <WithdrawalRequestForm framed={false} />
                  </FormModal>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  ["Wallet", formatCurrency(walletBalance)],
                  ["Locked", formatCurrency(protectedFunds)],
                  ["Plans", `${activePlans.length} active`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs font-medium text-white/62">{label}</p>
                    <p className="mt-1 text-sm font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
              {[
                {
                  icon: Landmark,
                  label: "Plans",
                  caption: `${activePlans.length} active`,
                  tone: "green",
                  title: "Create contribution plan",
                  description: "Set up an Ajo or personal savings plan.",
                  form: (close: () => void) => (
                    <CreateContributionPlanForm
                      framed={false}
                      onSuccess={close}
                    />
                  ),
                },
                {
                  icon: Plus,
                  label: "Fund",
                  caption: "Top up soon",
                  tone: "slate",
                  title: "Deposit funds",
                  description: "Validate a wallet top-up before payment integration.",
                  form: () => <DepositForm framed={false} />,
                },
                {
                  icon: LockKeyhole,
                  label: "Lock",
                  caption: "Protected",
                  tone: "blue",
                  title: "Create locked plan",
                  description: "Choose frequency, lock preference, and withdrawal access.",
                  form: (close: () => void) => (
                    <CreateContributionPlanForm
                      framed={false}
                      onSuccess={close}
                    />
                  ),
                },
                {
                  icon: ReceiptText,
                  label: "Statement",
                  caption: "PDF export",
                  tone: "amber",
                  title: "Request statement",
                  description: "Prepare a transaction statement.",
                  form: () => <StatementRequestForm framed={false} />,
                },
              ].map(({ icon, label, caption, tone, title, description, form }) => (
                <FormModal
                  key={label}
                  title={title}
                  description={description}
                  trigger={
                    <button className="group flex min-h-28 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border/80 bg-card/88 p-3 text-center shadow-sm shadow-slate-950/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none dark:bg-card/72">
                      <ToneIcon icon={icon} tone={tone} />
                      <span className="grid gap-1">
                        <span className="text-sm font-bold">{label}</span>
                        <span className="hidden text-[0.7rem] font-medium text-muted-foreground sm:block">
                          {caption}
                        </span>
                      </span>
                    </button>
                  }
                >
                  {(close) => form(close)}
                </FormModal>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="fintech-surface rounded-[1.35rem]">
          <CardHeader>
            <CardTitle>Financial health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map(({ icon: Icon, label, value, caption }) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-accent text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{caption}</p>
                  </div>
                </div>
                <span className="text-sm font-bold">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <Card className="fintech-surface rounded-[1.35rem]">
          <CardHeader>
            <CardTitle>Plan progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.plans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No contribution plans yet. Create a plan or join an Ajo to start tracking progress.
              </div>
            ) : (
              dashboard.plans.slice(0, 4).map((plan) => {
                const targetAmount = Number(plan.target_amount) || 0
                const savedAmount = Number(plan.saved_amount) || 0
                const progressNumber = targetAmount
                  ? Math.min(100, Math.round((savedAmount / targetAmount) * 100))
                  : 0
                const progress = `${progressNumber}%`
                const caption = `${formatCurrency(savedAmount)} of ${formatCurrency(targetAmount)}`

                return (
                  <div key={plan.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">{plan.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
                      </div>
                      <span className="status-pill">{progress}</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: progress }} />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="fintech-surface rounded-[1.35rem]">
          <CardHeader className="gap-3">
            <CardTitle>Recent activity</CardTitle>
            <div className="grid gap-2 sm:grid-cols-[1fr_10rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={activityQuery}
                  onChange={(event) => setActivityQuery(event.target.value)}
                  placeholder="Search activity"
                  className="h-10 rounded-xl pl-9"
                />
              </div>
              <Select value={activityStatus} onValueChange={setActivityStatus}>
                <SelectTrigger className="h-10 w-full rounded-xl bg-card/75 px-3">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredTransactions.map(({ id, title, amount, status, time, type }) => {
              const Icon = type === "out" ? ArrowUpRight : type === "lock" ? LockKeyhole : ArrowDownLeft

              return (
                <div key={id} className="grid gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 transition-colors hover:border-primary/20 hover:bg-card sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{title}</p>
                      <p className="text-xs text-muted-foreground">{time}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end sm:text-right">
                    <span className="status-pill capitalize">{status}</span>
                    <p className="min-w-28 text-sm font-bold">{amount}</p>
                  </div>
                </div>
              )
            })}
            {filteredTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No activity matches your search.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
