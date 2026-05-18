"use client"

import { Download } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { getAdminData } from "@/components/admin/admin-data"
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"

export default function AdminTransactionsPage() {
  const { data } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: getAdminData,
  })

  if (!data) return null

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
        rows={data.transactions}
        statusIndex={3}
      />
    </div>
  )
}
