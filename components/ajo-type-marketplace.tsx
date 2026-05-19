"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarClock, ListChecks, Users } from "lucide-react"
import { toast } from "sonner"

import { SkeletonBlock } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"

type AjoType = {
  id: string
  plan_name: string
  description: string | null
  target_amount: number
  min_contribution: number
  frequency: string
  withdrawal_access: string
  lock_duration_months: number
  member_limit: number
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

async function fetchAjoTypes(): Promise<AjoType[]> {
  const { data, error } = await supabase
    .from("ajo_types")
    .select(
      "id, plan_name, description, target_amount, min_contribution, frequency, withdrawal_access, lock_duration_months, member_limit"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

async function joinAjoType({
  ajoType,
  userId,
}: {
  ajoType: AjoType
  userId: string
}) {
  const { error } = await supabase.from("contribution_plans").insert({
    user_id: userId,
    title: ajoType.plan_name,
    target_amount: ajoType.target_amount,
    lock_duration: `${ajoType.lock_duration_months} months`,
    status: "active",
  })

  if (error) {
    throw error
  }
}

export function AjoTypeMarketplace() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { data: ajoTypes = [], isLoading, isError } = useQuery({
    queryKey: ["ajo-types"],
    queryFn: fetchAjoTypes,
  })

  const joinMutation = useMutation({
    mutationFn: joinAjoType,
    onSuccess: () => {
      toast.success("Ajo joined. Your plan has been created.")
      queryClient.invalidateQueries({ queryKey: ["ajo-types"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to join Ajo")
    },
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="fintech-surface rounded-[1.35rem]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <SkeletonBlock className="size-10 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-5 w-3/5" />
                  <SkeletonBlock className="h-4 w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SkeletonBlock className="h-16" />
                <SkeletonBlock className="h-16" />
              </div>
              <SkeletonBlock className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError || ajoTypes.length === 0) {
    return (
      <Card className="fintech-surface rounded-[1.35rem]">
        <CardContent className="p-5">
          <p className="text-sm font-bold">No joinable Ajo yet</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Once an admin creates an active Ajo type, it will appear here for
            users to join.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {ajoTypes.map((ajoType) => (
        <Card
          key={ajoType.id}
          className="fintech-surface fintech-card-hover rounded-[1.35rem]"
        >
          <CardHeader>
            <CardTitle className="flex items-start justify-between gap-3">
              <span>{ajoType.plan_name}</span>
              <span className="grid size-10 place-items-center rounded-2xl bg-accent text-primary">
                <ListChecks className="size-4" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {ajoType.description || "Join this Ajo and start contributing."}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="font-bold">{formatCurrency(ajoType.target_amount)}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Minimum</p>
                <p className="font-bold">
                  {formatCurrency(ajoType.min_contribution)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
                <CalendarClock className="size-3.5" />
                {ajoType.frequency}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
                <Users className="size-3.5" />
                {ajoType.member_limit} members
              </span>
              <span className="rounded-full border border-border px-2.5 py-1">
                {ajoType.lock_duration_months} months
              </span>
            </div>
            <Button
              className="h-10 w-full rounded-xl"
              disabled={!user || joinMutation.isPending}
              onClick={() =>
                user && joinMutation.mutate({ ajoType, userId: user.id })
              }
            >
              {joinMutation.isPending ? "Joining..." : "Join Ajo"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
