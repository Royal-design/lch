"use client"

import { Medal } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { AdminPageHeader, AdminPageSkeleton } from "@/components/admin/admin-ui"
import { Card, CardContent } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type LeaderboardEntry = {
  user_id: string
  name: string
  total: number
  plans: number
  rank: number
  score: number
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

async function fetchLeaderboard() {
  const data = await apiRequest<{ leaderboard: LeaderboardEntry[] }>(
    "/api/contributions/leaderboard"
  )
  return data.leaderboard
}

export default function AdminLeaderboardPage() {
  const { data: leaderboard } = useQuery({
    queryKey: ["admin-leaderboard"],
    queryFn: fetchLeaderboard,
  })

  if (!leaderboard) return <AdminPageSkeleton variant="cards" />

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        eyebrow="Leaderboard"
        title="Contribution ranking system"
        description="Rank users by total contributions, savings consistency, active plans, and deposit frequency."
      />
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <Card className="fintech-surface rounded-[1.35rem]">
            <CardContent className="p-5 text-sm text-muted-foreground">
              No contribution ranking yet.
            </CardContent>
          </Card>
        ) : (
          leaderboard.map((entry) => (
            <Card
              key={entry.user_id}
              className={cn(
                "fintech-surface rounded-[1.35rem]",
                entry.rank <= 3 && "border-primary/25 bg-accent/35"
              )}
            >
              <CardContent className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
                  {entry.rank}
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-full bg-card text-sm font-bold ring-1 ring-border">
                    {entry.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{entry.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.plans} tracked plans
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Contributed
                  </p>
                  <p className="font-bold">{formatCurrency(entry.total)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Medal className="size-4 text-primary" />
                  <span className="font-bold">{entry.score}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
