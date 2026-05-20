"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ban, CheckCircle2, Loader2, LockKeyhole, RotateCcw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
  AdminPageHeader,
  AdminPageSkeleton,
  StatusBadge,
} from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"

type AdminPlan = {
  id: string
  title: string
  target_amount: number
  saved_amount: number
  lock_duration: string
  status: string
  profiles: { full_name: string; email: string } | null
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

async function fetchAdminPlans() {
  const data = await apiRequest<{ plans: AdminPlan[] }>(
    "/api/admin/contribution-plans"
  )
  return data.plans
}

export default function AdminContributionPlansPage() {
  const queryClient = useQueryClient()
  const [pendingAction, setPendingAction] = useState<{
    id: string
    action: "lock" | "disable"
    status: string
  } | null>(null)
  const { data: plans } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: fetchAdminPlans,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/api/admin/contribution-plans/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      toast.success("Plan status updated.")
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] })
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to update plan"
      )
    },
    onSettled: () => {
      setPendingAction(null)
    },
  })

  if (!plans) return <AdminPageSkeleton variant="cards" />

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Contribution Plans"
        title="Savings plan management"
        description="Review plan health, lock policy, progress, and soft-block actions."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.length === 0 ? (
          <Card className="fintech-surface rounded-[1.35rem] md:col-span-2 xl:col-span-3">
            <CardContent className="p-5 text-sm text-muted-foreground">
              No contribution plans have been created yet.
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => {
            const savedAmount = Number(plan.saved_amount) || 0
            const targetAmount = Number(plan.target_amount) || 0
            const progress = targetAmount
              ? Math.min(Math.round((savedAmount / targetAmount) * 100), 100)
              : 0
            const owner =
              plan.profiles?.full_name || plan.profiles?.email || "Unknown user"
            const nextStatus = plan.status === "paused" ? "active" : "paused"
            const isLockActionPending =
              pendingAction?.id === plan.id && pendingAction.action === "lock"
            const isDisableActionPending =
              pendingAction?.id === plan.id && pendingAction.action === "disable"
            const planIsClosed = ["cancelled", "completed"].includes(plan.status)

            return (
              <Card key={plan.id} className="fintech-surface rounded-[1.35rem]">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-3">
                    <span>{plan.title}</span>
                    <StatusBadge
                      status={plan.status === "paused" ? "locked" : plan.status}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{owner}</p>
                  <div className="mt-4 flex items-end justify-between text-sm">
                    <p className="text-xl font-bold">
                      {formatCurrency(savedAmount)}
                    </p>
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
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {plan.lock_duration}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        disabled={
                          isLockActionPending ||
                          planIsClosed
                        }
                        onClick={() => {
                          setPendingAction({
                            id: plan.id,
                            action: "lock",
                            status: nextStatus,
                          })
                          statusMutation.mutate({
                            id: plan.id,
                            status: nextStatus,
                          })
                        }}
                      >
                        {isLockActionPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : plan.status === "paused" ? (
                          <RotateCcw className="size-3.5" />
                        ) : (
                          <LockKeyhole className="size-3.5" />
                        )}
                        {plan.status === "paused" ? "Unlock" : "Lock"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        disabled={isDisableActionPending}
                        onClick={() => {
                          const status =
                            plan.status === "cancelled" ? "active" : "cancelled"
                          setPendingAction({
                            id: plan.id,
                            action: "disable",
                            status,
                          })
                          statusMutation.mutate({
                            id: plan.id,
                            status,
                          })
                        }}
                      >
                        {isDisableActionPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : plan.status === "cancelled" ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <Ban className="size-3.5" />
                        )}
                        {plan.status === "cancelled" ? "Enable" : "Disable"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
