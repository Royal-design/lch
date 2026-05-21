"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

import {
  AdminPageHeader,
  AdminPageSkeleton,
  StatusBadge,
} from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"

type WithdrawalRow = {
  id: string
  user_id: string
  amount: number
  status: string
  reference: string
  description: string | null
  gateway_response: string | null
  metadata: {
    bank_name?: string
    account_number?: string
    account_name?: string
    reason?: string
  } | null
  created_at: string
  profiles:
    | {
        full_name: string | null
        email: string | null
      }
    | {
        full_name: string | null
        email: string | null
      }[]
    | null
  wallet: {
    balance: number
    locked_balance: number
  } | null
}

type WithdrawalsResponse = {
  withdrawals: WithdrawalRow[]
}

function fetchWithdrawals() {
  return apiRequest<WithdrawalsResponse>("/api/admin/withdrawals")
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString))
}

function profileLabel(profile: WithdrawalRow["profiles"]) {
  const value = Array.isArray(profile) ? profile[0] : profile

  return value?.full_name || value?.email || "LCH Member"
}

async function updateWithdrawal(id: string, action: "approve" | "reject") {
  await apiRequest(`/api/admin/withdrawals/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  })
}

export default function AdminWithdrawalsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: fetchWithdrawals,
  })
  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      updateWithdrawal(id, action),
    onSuccess: (_, variables) => {
      toast.success(
        variables.action === "approve"
          ? "Withdrawal approved."
          : "Withdrawal rejected and funds released."
      )
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] })
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] })
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to update withdrawal"
      )
    },
  })

  if (isLoading) return <AdminPageSkeleton variant="table" />

  const withdrawals = data?.withdrawals ?? []

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Withdrawals"
        title="Withdrawal review queue"
        description="Approve requests after payout, or reject to release reserved funds back to the member wallet."
      />
      <Card className="fintech-surface rounded-[1.35rem]">
        <CardHeader>
          <CardTitle>Requests ({withdrawals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {[
                    "User",
                    "Amount",
                    "Bank",
                    "Request Date",
                    "Status",
                    "Available",
                    "Reserved",
                    "Actions",
                  ].map((column) => (
                    <th key={column} className="px-3 py-3 font-bold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => {
                  const disabled =
                    withdrawal.status !== "pending" || mutation.isPending

                  return (
                    <tr
                      key={withdrawal.id}
                      className="border-b border-border/70 last:border-0"
                    >
                      <td className="px-3 py-4">
                        <p className="font-semibold">
                          {profileLabel(withdrawal.profiles)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {withdrawal.reference}
                        </p>
                      </td>
                      <td className="px-3 py-4 font-semibold">
                        {formatCurrency(Number(withdrawal.amount) || 0)}
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-medium">
                          {withdrawal.metadata?.bank_name || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {withdrawal.metadata?.account_name || "-"} ·{" "}
                          {withdrawal.metadata?.account_number || "-"}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">
                        {formatDate(withdrawal.created_at)}
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge
                          status={
                            withdrawal.status === "cancelled"
                              ? "Rejected"
                              : withdrawal.status
                          }
                        />
                      </td>
                      <td className="px-3 py-4">
                        {formatCurrency(Number(withdrawal.wallet?.balance) || 0)}
                      </td>
                      <td className="px-3 py-4">
                        {formatCurrency(
                          Number(withdrawal.wallet?.locked_balance) || 0
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={disabled}
                            className="rounded-xl"
                            onClick={() =>
                              mutation.mutate({
                                id: withdrawal.id,
                                action: "approve",
                              })
                            }
                          >
                            <CheckCircle2 className="size-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={disabled}
                            className="rounded-xl"
                            onClick={() =>
                              mutation.mutate({
                                id: withdrawal.id,
                                action: "reject",
                              })
                            }
                          >
                            <XCircle className="size-3.5" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {withdrawals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No withdrawal requests yet.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
