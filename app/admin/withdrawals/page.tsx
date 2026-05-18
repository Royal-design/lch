"use client"

import { useQuery } from "@tanstack/react-query"

import { getAdminData } from "@/components/admin/admin-data"
import {
  AdminPageHeader,
  StatusBadge,
  WithdrawalActions,
} from "@/components/admin/admin-ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminWithdrawalsPage() {
  const { data } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: getAdminData,
  })

  if (!data) return null

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Withdrawals"
        title="Withdrawal review queue"
        description="Approve or reject requests with clear balance and lock-state visibility. Non-pending requests cannot be approved twice."
      />
      <Card className="fintech-surface rounded-[1.35rem]">
        <CardHeader>
          <CardTitle>Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {["User", "Amount", "Request Date", "Status", "Available Balance", "Lock Status", "Actions"].map((column) => (
                    <th key={column} className="px-3 py-3 font-bold">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.withdrawals.map(([user, amount, date, status, balance, lock]) => (
                  <tr key={`${user}-${date}`} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-4 font-semibold">{user}</td>
                    <td className="px-3 py-4">{amount}</td>
                    <td className="px-3 py-4">{date}</td>
                    <td className="px-3 py-4"><StatusBadge status={status} /></td>
                    <td className="px-3 py-4">{balance}</td>
                    <td className="px-3 py-4">{lock}</td>
                    <td className="px-3 py-4"><WithdrawalActions status={status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
