"use client"

import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { getAdminData } from "@/components/admin/admin-data"
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"

export default function AdminUsersPage() {
  const { data } = useQuery({ queryKey: ["admin-users"], queryFn: getAdminData })

  if (!data) return null

  const rows = data.users.map((row) => [
    ...row,
    row[5] === "Active" ? "Suspend" : "Activate",
  ])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Users"
        title="User management"
        description="Search members, monitor balances, and prepare account controls for compliance workflows."
      />
      <AdminDataTable
        title="Users"
        columns={["Name", "Email", "Phone", "Total Balance", "Locked Savings", "Status", "Join Date", "Action"]}
        rows={rows}
        statusIndex={5}
      />
      <Button
        variant="outline"
        className="rounded-xl"
        onClick={() => toast.success("User detail drawer placeholder ready.")}
      >
        Test detail drawer action
      </Button>
    </div>
  )
}
