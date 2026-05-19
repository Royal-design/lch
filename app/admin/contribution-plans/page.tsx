"use client"

import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { getAdminData } from "@/components/admin/admin-data"
import {
  AdminPageHeader,
  AdminPageSkeleton,
  StatusBadge,
} from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminContributionPlansPage() {
  const { data } = useQuery({ queryKey: ["admin-plans"], queryFn: getAdminData })

  if (!data) return <AdminPageSkeleton variant="cards" />

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Contribution Plans"
        title="Savings plan management"
        description="Review plan health, lock policy, progress, and soft-block actions."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.plans.map(([name, user, target, saved, lock, progress, status]) => (
          <Card key={name} className="fintech-surface rounded-[1.35rem]">
            <CardHeader>
              <CardTitle className="flex items-start justify-between gap-3">
                <span>{name}</span>
                <StatusBadge status={status} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{user}</p>
              <div className="mt-4 flex items-end justify-between text-sm">
                <p className="text-xl font-bold">{saved}</p>
                <p className="text-muted-foreground">{target}</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: progress }} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-muted-foreground">{lock}</span>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast.error("Plan soft-blocked.")}>
                  Disable
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
