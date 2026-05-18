"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ChartDatum = {
  day: string
  deposits: number
  withdrawals: number
  users: number
  contributions: number
}

const tooltipStyle = {
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--card-foreground)",
  boxShadow: "0 18px 42px rgba(15,23,42,0.12)",
}

function ChartFrame({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="fintech-surface rounded-[1.35rem]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">{children}</div>
      </CardContent>
    </Card>
  )
}

export function DepositFlowChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartFrame title="Revenue / Deposit Flow">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -20, right: 12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="4 8" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="deposits" stroke="var(--primary)" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function DepositWithdrawalChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartFrame title="Withdrawal vs Deposit">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="4 8" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="deposits" fill="var(--primary)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="withdrawals" fill="oklch(0.68 0.13 35)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function ActiveUsersChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartFrame title="Active Users Growth">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -20, right: 12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="4 8" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="users" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.16} strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function ContributionGrowthChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartFrame title="Contribution Growth">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -20, right: 12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="4 8" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="contributions" stackId="1" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
          <Area type="monotone" dataKey="deposits" stackId="1" stroke="oklch(0.58 0.13 225)" fill="oklch(0.58 0.13 225)" fillOpacity={0.12} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
