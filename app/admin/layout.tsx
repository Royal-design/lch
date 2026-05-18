import { AdminQueryProvider } from "@/components/admin/admin-query-provider"
import { AdminShell } from "@/components/admin/admin-shell"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminQueryProvider>
      <AdminShell>{children}</AdminShell>
    </AdminQueryProvider>
  )
}
