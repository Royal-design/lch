"use client"

import { Medal } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { getAdminData } from "@/components/admin/admin-data"
import { AdminPageHeader } from "@/components/admin/admin-ui"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function AdminLeaderboardPage() {
  const { data } = useQuery({ queryKey: ["admin-leaderboard"], queryFn: getAdminData })

  if (!data) return null

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        eyebrow="Leaderboard"
        title="Contribution ranking system"
        description="Rank users by total contributions, savings consistency, active plans, and deposit frequency."
      />
      <div className="space-y-3">
        {data.leaderboard.map(([rank, name, total, plans, streak]) => (
          <Card
            key={rank}
            className={cn(
              "fintech-surface rounded-[1.35rem]",
              Number(rank) <= 3 && "border-primary/25 bg-accent/35"
            )}
          >
            <CardContent className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
                {rank}
              </div>
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-full bg-card text-sm font-bold ring-1 ring-border">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{name}</p>
                  <p className="text-sm text-muted-foreground">{plans} active plans</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Contributed</p>
                <p className="font-bold">{total}</p>
              </div>
              <div className="flex items-center gap-2">
                <Medal className="size-4 text-primary" />
                <span className="font-bold">{streak}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
