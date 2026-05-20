"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CalendarDays, HandCoins, Users } from "lucide-react"

import {
  AdminDataTable,
  AdminPageHeader,
  AdminPageSkeleton,
  KpiCard,
} from "@/components/admin/admin-ui"
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

type AdminUser = {
  id: string
  full_name: string
  email: string
  status: string
}

type ContributionReport = {
  summary: {
    totalAmount: number
    contributionCount: number
    averageAmount: number
    activeDays: number
  }
  byPeriod: { label: string; amount: number; count: number }[]
  byUser: {
    user_id: string
    name: string
    email: string
    amount: number
    count: number
  }[]
  contributions: {
    id: string
    user: string
    email: string
    amount: number
    status: string
    reference: string
    description: string | null
    created_at: string
  }[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

async function fetchAdminUsers() {
  const data = await apiRequest<{ users: AdminUser[] }>("/api/admin/users")
  return data.users
}

async function fetchContributionReport(filters: {
  userId: string
  status: string
  period: string
  from: string
  to: string
}) {
  const params = new URLSearchParams()
  if (filters.userId !== "all") params.set("userId", filters.userId)
  if (filters.status !== "all") params.set("status", filters.status)
  params.set("period", filters.period)
  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)

  const query = params.toString()
  return apiRequest<ContributionReport>(
    `/api/admin/contributions${query ? `?${query}` : ""}`
  )
}

export default function AdminContributionsPage() {
  const [userId, setUserId] = useState("all")
  const [status, setStatus] = useState("all")
  const [period, setPeriod] = useState("month")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const filters = useMemo(
    () => ({ userId, status, period, from, to }),
    [from, period, status, to, userId]
  )

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  })
  const { data } = useQuery({
    queryKey: ["admin-contributions", filters],
    queryFn: () => fetchContributionReport(filters),
  })

  if (!data) return <AdminPageSkeleton variant="overview" />

  const rows = data.contributions.map((contribution) => [
    contribution.user,
    formatCurrency(contribution.amount),
    contribution.status,
    contribution.description || "Contribution",
    contribution.reference,
    formatDate(contribution.created_at),
  ])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Contributions"
        title="User contribution records"
        description="Review how each user contributes across days, weeks, months, or custom date ranges."
      />

      <Card className="fintech-surface rounded-[1.35rem]">
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger className="h-11 w-full rounded-xl bg-card/75">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All users</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-11 w-full rounded-xl bg-card/75">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 w-full rounded-xl bg-card/75">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="h-11 rounded-xl"
            aria-label="From date"
          />
          <Input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="h-11 rounded-xl"
            aria-label="To date"
          />
        </CardContent>
      </Card>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={HandCoins}
          label="Total contributed"
          value={formatCurrency(data.summary.totalAmount)}
          trend="Filtered"
        />
        <KpiCard
          icon={CalendarDays}
          label="Contribution records"
          value={data.summary.contributionCount.toLocaleString("en-NG")}
          trend="Count"
        />
        <KpiCard
          icon={HandCoins}
          label="Average contribution"
          value={formatCurrency(data.summary.averageAmount)}
          trend="Average"
        />
        <KpiCard
          icon={Users}
          label="Active days"
          value={data.summary.activeDays.toLocaleString("en-NG")}
          trend="Days"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="fintech-surface rounded-[1.35rem]">
          <CardHeader>
            <CardTitle>Period breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.byPeriod.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No contributions match these filters.
              </p>
            ) : (
              data.byPeriod.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/70 bg-background/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} records
                      </p>
                    </div>
                    <p className="text-sm font-bold">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="fintech-surface rounded-[1.35rem]">
          <CardHeader>
            <CardTitle>User totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.byUser.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No user contribution totals yet.
              </p>
            ) : (
              data.byUser.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 p-4"
                >
                  <div>
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.count} records
                    </p>
                  </div>
                  <p className="text-sm font-bold">
                    {formatCurrency(user.amount)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <AdminDataTable
        title="Contribution records"
        columns={["User", "Amount", "Status", "Plan", "Reference", "Date"]}
        rows={rows}
        statusIndex={2}
      />
    </div>
  )
}
