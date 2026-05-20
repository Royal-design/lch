"use client"

import { Download } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  AdminDataTable,
  AdminPageHeader,
  AdminPageSkeleton,
} from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"

type AdminTransaction = {
  id: string
  type: string
  amount: number
  status: string
  reference: string
  created_at: string
  profiles: { full_name: string; email: string } | null
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

async function fetchAdminTransactions() {
  const data = await apiRequest<{ transactions: AdminTransaction[] }>(
    "/api/admin/transactions"
  )
  return data.transactions
}

export default function AdminTransactionsPage() {
  const { data: transactions } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: fetchAdminTransactions,
  })

  if (!transactions) return <AdminPageSkeleton variant="table" />

  const rows = transactions.map((transaction) => [
    transaction.profiles?.full_name ||
      transaction.profiles?.email ||
      "Unknown user",
    transaction.type,
    formatCurrency(transaction.amount),
    transaction.status,
    transaction.reference,
    formatDate(transaction.created_at),
  ])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          eyebrow="Transactions"
          title="Financial ledger"
          description="Track deposits, withdrawals, contributions, failed transfers, references, and settlement state."
        />
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => toast.success("CSV export prepared.")}
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>
      <AdminDataTable
        title="Transactions"
        columns={["User", "Type", "Amount", "Status", "Reference ID", "Date"]}
        rows={rows}
        statusIndex={3}
      />
    </div>
  )
}
