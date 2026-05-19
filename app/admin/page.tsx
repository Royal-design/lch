"use client"

import { useQuery } from "@tanstack/react-query"

import {
  ActiveUsersChart,
  ContributionGrowthChart,
  DepositFlowChart,
  DepositWithdrawalChart,
} from "@/components/admin/admin-charts"
import { getAdminData } from "@/components/admin/admin-data"
import {
  AdminPageHeader,
  AdminPageSkeleton,
  KpiCard,
  StatusBadge,
} from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminOverviewPage() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminData,
  })

  if (!data) return <AdminPageSkeleton variant="overview" />

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Overview"
        title="Platform performance and risk posture"
        description="Monitor money flow, growth, pending actions, and operational exceptions across LCH."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <DepositFlowChart data={data.flowData} />
        <DepositWithdrawalChart data={data.flowData} />
        <ActiveUsersChart data={data.flowData} />
        <ContributionGrowthChart data={data.flowData} />
      </section>

      <Card className="fintech-surface rounded-[1.35rem]">
        <CardHeader>
          <CardTitle>Alerts and review queue</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {data.alerts.map(([severity, title, message, time]) => (
            <div
              key={title}
              className="rounded-2xl border border-border/70 bg-background/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <StatusBadge status={severity} />
                  <p className="mt-3 text-sm font-bold">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Review
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{time}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
