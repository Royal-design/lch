"use client"

import { useQuery } from "@tanstack/react-query"
import { CalendarClock, LockKeyhole, TrendingUp } from "lucide-react"

import { SkeletonBlock } from "@/components/admin/admin-ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"

type ContributionPlan = {
  id: string
  title: string
  target_amount: number
  saved_amount: number
  lock_duration: string
  status: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

async function fetchContributionPlans() {
  const data = await apiRequest<{ plans: ContributionPlan[] }>(
    "/api/contribution-plans"
  )
  return data.plans
}

export function ContributionPlanList() {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["contribution-plans"],
    queryFn: fetchContributionPlans,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="fintech-surface rounded-[1.35rem]">
            <CardContent className="space-y-4 p-5">
              <SkeletonBlock className="h-6 w-2/3" />
              <SkeletonBlock className="h-8 w-full" />
              <SkeletonBlock className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <Card className="fintech-surface rounded-[1.35rem]">
        <CardContent className="p-5 text-sm text-muted-foreground">
          Your joined and personal contribution plans will appear here.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => {
        const targetAmount = Number(plan.target_amount) || 0
        const savedAmount = Number(plan.saved_amount) || 0
        const progress = targetAmount
          ? Math.min(Math.round((savedAmount / targetAmount) * 100), 100)
          : 0

        return (
          <Card
            key={plan.id}
            className="fintech-surface fintech-card-hover rounded-[1.35rem]"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>{plan.title}</span>
                <span className="grid size-10 place-items-center rounded-2xl bg-accent text-primary">
                  <LockKeyhole className="size-4" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between text-sm">
                <p className="text-xl font-bold">{formatCurrency(savedAmount)}</p>
                <p className="text-muted-foreground">
                  {formatCurrency(targetAmount)}
                </p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="size-3.5" />
                  {plan.lock_duration}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  <TrendingUp className="size-3.5" />
                  {progress}%
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
