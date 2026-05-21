"use client"

import { useQuery } from "@tanstack/react-query"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Filter,
  Landmark,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react"
import { useState } from "react"

import { DepositForm } from "@/components/forms/deposit-form"
import { FormModal } from "@/components/forms/form-system"
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

type DashboardResponse = {
  wallet: {
    balance: number
    locked_balance: number
  }
  transactions: {
    id: string
    type: string
    amount: number
    status: string
    reference: string
    description: string | null
    created_at: string
  }[]
}

function fetchDashboard() {
  return apiRequest<DashboardResponse>("/api/dashboard")
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function transactionTitle(type: string, description: string | null) {
  if (description) return description
  if (type === "deposit") return "Wallet top up"
  if (type === "withdrawal") return "Withdrawal request"
  if (type === "contribution") return "Contribution payment"
  return type.replaceAll("_", " ")
}

export default function WalletPage() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  })
  const walletBalance = Number(data?.wallet.balance) || 0
  const lockedBalance = Number(data?.wallet.locked_balance) || 0
  const transactions = data?.transactions ?? []
  const pendingWithdrawals = transactions
    .filter((transaction) => transaction.type === "withdrawal" && transaction.status !== "successful")
    .reduce((total, transaction) => total + Number(transaction.amount), 0)
  const monthlyInflow = transactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.created_at)
      const now = new Date()

      return (
        transaction.type === "deposit" &&
        transaction.status === "successful" &&
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((total, transaction) => total + Number(transaction.amount), 0)
  const walletStats = [
    {
      icon: Landmark,
      label: "Locked savings",
      value: formatCurrency(lockedBalance),
      caption: "Reserved across plans",
    },
    {
      icon: CreditCard,
      label: "Pending withdrawals",
      value: formatCurrency(pendingWithdrawals),
      caption: "Processing review",
    },
    {
      icon: Banknote,
      label: "This month inflow",
      value: formatCurrency(monthlyInflow),
      caption: "Successful wallet deposits",
    },
  ]
  const filteredLedger = transactions.filter((transaction) => {
    const title = transactionTitle(transaction.type, transaction.description)
    const amount =
      transaction.type === "withdrawal"
        ? `-${formatCurrency(Number(transaction.amount))}`
        : formatCurrency(Number(transaction.amount))
    const matchesQuery = `${title} ${transaction.reference} ${amount} ${transaction.status}`
      .toLowerCase()
      .includes(query.toLowerCase())
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter

    return matchesQuery && matchesStatus
  })

  return (
    <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.08fr_0.82fr]">
      <section className="space-y-5">
        <div className="relative overflow-hidden rounded-[1.7rem] bg-[radial-gradient(circle_at_86%_10%,rgba(255,255,255,0.25),transparent_8rem),linear-gradient(135deg,oklch(0.35_0.1_158),oklch(0.2_0.04_245))] p-5 text-white shadow-[0_24px_70px_rgba(7,95,63,0.2)] sm:p-7 dark:shadow-black/35">
          <div className="absolute inset-x-7 top-0 h-px bg-white/35" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/76 backdrop-blur">
                <Wallet className="size-3.5" />
                Primary wallet
              </div>
              <h1 className="mt-5 text-[2.5rem] font-bold leading-none tracking-tight sm:text-5xl">
                {isLoading ? "..." : formatCurrency(walletBalance)}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/68">
                Funds available for withdrawals, transfers, and new contribution plans.
              </p>
            </div>
            <div className="hidden size-14 place-items-center rounded-2xl border border-white/15 bg-white/10 sm:grid">
              <ShieldCheck className="size-6" />
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <FormModal
              title="Deposit funds"
              description="Validate a top-up before connecting payment rails."
              trigger={
                <Button className="h-12 rounded-full bg-white text-slate-950 shadow-none hover:bg-white/90">
                  <ArrowDownLeft className="size-4" />
                  Deposit
                </Button>
              }
            >
              <DepositForm framed={false} />
            </FormModal>
            <FormModal
              title="Request withdrawal"
              description="Check amount and reason before submitting a withdrawal request."
              trigger={
                <Button className="h-12 rounded-full border border-white/20 bg-white/10 text-white shadow-none hover:bg-white/15">
                  <ArrowUpRight className="size-4" />
                  Withdraw
                </Button>
              }
            >
              <WithdrawalRequestForm framed={false} walletBalance={walletBalance} />
            </FormModal>
          </div>
        </div>

        <Card className="fintech-surface rounded-[1.35rem]">
          <CardHeader className="gap-3">
            <CardTitle>Wallet activity</CardTitle>
            <div className="grid gap-2 sm:grid-cols-[1fr_10rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search wallet activity"
                  className="h-10 rounded-xl pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full rounded-xl bg-card/75 px-3">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredLedger.map((transaction) => {
              const title = transactionTitle(transaction.type, transaction.description)
              const amount =
                transaction.type === "withdrawal"
                  ? `-${formatCurrency(Number(transaction.amount))}`
                  : formatCurrency(Number(transaction.amount))
              const status = transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)

              return (
              <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 transition-colors hover:border-primary/20 hover:bg-card">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
                    {transaction.type === "withdrawal" ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{amount}</p>
                  <span className="status-pill mt-1">{status}</span>
                </div>
              </div>
            )})}
            {filteredLedger.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <Filter className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">No wallet activity found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try another search or status filter.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-5">
        <Card className="fintech-surface rounded-[1.35rem]">
          <CardHeader>
            <CardTitle>Wallet details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {walletStats.map(({ icon: Icon, label, value, caption }) => (
              <div key={label} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-accent text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{label}</p>
                    <p className="text-xs text-muted-foreground">{caption}</p>
                  </div>
                </div>
                <p className="mt-4 text-xl font-bold tracking-tight">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
