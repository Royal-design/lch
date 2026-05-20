"use client"

import { useQuery } from "@tanstack/react-query"
import { ReceiptText } from "lucide-react"

import { SkeletonBlock } from "@/components/admin/admin-ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"

type ContributionRecord = {
  id: string
  amount: number
  status: string
  reference: string
  description: string | null
  created_at: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

async function fetchContributions() {
  const data = await apiRequest<{ contributions: ContributionRecord[] }>(
    "/api/contributions"
  )
  return data.contributions
}

export function ContributionHistory() {
  const { data: contributions = [], isLoading } = useQuery({
    queryKey: ["contributions"],
    queryFn: fetchContributions,
  })

  return (
    <Card className="fintech-surface rounded-[1.35rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ReceiptText className="size-4 text-primary" />
          Contribution history
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-16 rounded-2xl" />
          ))
        ) : contributions.length === 0 ? (
          <p className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
            No recorded contributions yet.
          </p>
        ) : (
          contributions.map((contribution) => (
            <div
              key={contribution.id}
              className="rounded-2xl border border-border/70 bg-background/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">
                    {contribution.description || "Contribution"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(contribution.created_at)}
                  </p>
                </div>
                <p className="text-sm font-bold">
                  {formatCurrency(contribution.amount)}
                </p>
              </div>
              <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {contribution.reference}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
