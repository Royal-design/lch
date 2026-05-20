"use client"

import { useQuery } from "@tanstack/react-query"
import { Trophy } from "lucide-react"

import { SkeletonBlock } from "@/components/admin/admin-ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"

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

export function ContributionLeaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
  })

  return (
    <Card className="fintech-surface rounded-[1.35rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-4 text-primary" />
          Ajo leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-18 rounded-2xl" />
          ))
        ) : leaderboard.length === 0 ? (
          <p className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
            No contribution ranking yet.
          </p>
        ) : (
          leaderboard.slice(0, 5).map((entry) => (
            <div
              key={entry.user_id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-accent text-sm font-bold text-primary">
                  {entry.rank}
                </div>
                <div>
                  <p className="text-sm font-bold">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Contribution score {entry.score}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold">{formatCurrency(entry.total)}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
