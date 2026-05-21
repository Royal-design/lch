"use client"

import { useQuery } from "@tanstack/react-query"

import {
  ActiveUsersChart,
  ContributionGrowthChart,
  DepositFlowChart,
  DepositWithdrawalChart,
} from "@/components/admin/admin-charts"
import { AdminPageHeader, AdminPageSkeleton } from "@/components/admin/admin-ui"
import { Card, CardContent } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"

type AnalyticsResponse = {
  flowData: {
    day: string
    deposits: number
    withdrawals: number
    users: number
    contributions: number
  }[]
  insights: {
    label: string
    value: string
    caption: string
  }[]
}

async function fetchAnalytics() {
  return apiRequest<AnalyticsResponse>("/api/admin/analytics")
}

export default function AdminAnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: fetchAnalytics,
  })

  if (!data) return <AdminPageSkeleton variant="overview" />

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Analytics"
        title="Deep financial insights"
        description="Analyze active users, inflow, withdrawals, savings growth rate, and retention signals."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {data.insights.map(({ label, value, caption }) => (
          <Card key={label} className="fintech-surface rounded-[1.35rem]">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <section className="grid gap-5 xl:grid-cols-2">
        <ActiveUsersChart data={data.flowData} />
        <DepositFlowChart data={data.flowData} />
        <DepositWithdrawalChart data={data.flowData} />
        <ContributionGrowthChart data={data.flowData} />
      </section>
    </div>
  )
}
