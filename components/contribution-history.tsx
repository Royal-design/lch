"use client"

import { useQuery } from "@tanstack/react-query"
import { ReceiptText } from "lucide-react"
import { useState } from "react"

import { SkeletonBlock } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
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

type PaginatedContributionResponse = {
  contributions: ContributionRecord[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
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

async function fetchContributions(page: number) {
  return apiRequest<PaginatedContributionResponse>(
    `/api/contributions?page=${page}&pageSize=10`
  )
}

export function ContributionHistory() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ["contributions", page],
    queryFn: () => fetchContributions(page),
  })
  const contributions = data?.contributions ?? []
  const pagination = data?.pagination

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
              <p className="mt-2 text-[0.68rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {contribution.reference}
              </p>
            </div>
          ))
        )}
        {pagination && pagination.totalPages > 1 ? (
          <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} -{" "}
              {pagination.total.toLocaleString("en-NG")} records
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={pagination.page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, pagination.totalPages)
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
