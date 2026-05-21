"use client"

import { Download } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  AdminDataTable,
  AdminPageHeader,
  AdminPageSkeleton,
} from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

type AdminUser = {
  id: string
  full_name: string
  email: string
}

type PaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
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

async function fetchAdminUsers() {
  const data = await apiRequest<{ users: AdminUser[] }>("/api/admin/users")
  return data.users
}

async function fetchAdminTransactions(filters: {
  userId: string
  type: string
  status: string
  from: string
  to: string
  page: number
}) {
  const params = new URLSearchParams()
  if (filters.userId !== "all") params.set("userId", filters.userId)
  if (filters.type !== "all") params.set("type", filters.type)
  if (filters.status !== "all") params.set("status", filters.status)
  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)
  params.set("page", String(filters.page))
  params.set("pageSize", "25")
  const query = params.toString()
  return apiRequest<{
    transactions: AdminTransaction[]
    pagination: PaginationMeta
  }>(
    `/api/admin/transactions${query ? `?${query}` : ""}`
  )
}

export default function AdminTransactionsPage() {
  const [userId, setUserId] = useState("all")
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)
  const filters = useMemo(
    () => ({ userId, type, status, from, to, page }),
    [from, page, status, to, type, userId]
  )
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  })
  const { data } = useQuery({
    queryKey: ["admin-transactions", filters],
    queryFn: () => fetchAdminTransactions(filters),
  })

  if (!data) return <AdminPageSkeleton variant="table" />

  const rows = data.transactions.map((transaction) => [
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
      <Card className="fintech-surface rounded-[1.35rem]">
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <Select
            value={userId}
            onValueChange={(value) => {
              setUserId(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-xl bg-card/75">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All users</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={type}
            onValueChange={(value) => {
              setType(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-xl bg-card/75">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="contribution">Contributions</SelectItem>
              <SelectItem value="lock">Locks</SelectItem>
              <SelectItem value="unlock">Unlocks</SelectItem>
              <SelectItem value="adjustment">Adjustments</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-xl bg-card/75">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value)
              setPage(1)
            }}
            className="h-11 rounded-xl"
            aria-label="From date"
          />
          <Input
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value)
              setPage(1)
            }}
            className="h-11 rounded-xl"
            aria-label="To date"
          />
        </CardContent>
      </Card>
      <AdminDataTable
        title="Transactions"
        columns={["User", "Type", "Amount", "Status", "Reference ID", "Date"]}
        rows={rows}
        statusIndex={3}
        footer={
          <TablePagination
            pagination={data.pagination}
            onPrevious={() => setPage((current) => Math.max(current - 1, 1))}
            onNext={() =>
              setPage((current) =>
                Math.min(current + 1, data.pagination.totalPages)
              )
            }
          />
        }
      />
    </div>
  )
}

function TablePagination({
  pagination,
  onPrevious,
  onNext,
}: {
  pagination: PaginationMeta
  onPrevious: () => void
  onNext: () => void
}) {
  return (
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
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={pagination.page >= pagination.totalPages}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
