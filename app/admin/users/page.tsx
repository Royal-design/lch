"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, Loader2, Search, Shield, Trash2, UserCheck, UserX } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { AdminPageHeader, AdminPageSkeleton } from "@/components/admin/admin-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiRequest } from "@/lib/api-client"

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  status: string
  created_at: string
}

interface Role {
  id: string
  name: string
  display_name: string
}

interface ProfileWithWallet extends Profile {
  wallets: { balance: number; locked_balance: number }[] | null
}

const USERS_PAGE_SIZE = 20

async function fetchUsers(): Promise<ProfileWithWallet[]> {
  const data = await apiRequest<{ users: ProfileWithWallet[] }>("/api/admin/users")
  return data.users
}

async function fetchRoles(): Promise<Role[]> {
  const data = await apiRequest<{ roles: Role[] }>("/api/admin/roles")
  return data.roles
}

async function updateUserStatus(
  userId: string,
  status: string
): Promise<boolean> {
  await apiRequest(`/api/admin/users/${userId}?action=status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
  toast.success(`User ${status === "active" ? "activated" : "suspended"}`)
  return true
}

async function updateUserRole(userId: string, role: string): Promise<boolean> {
  await apiRequest(`/api/admin/users/${userId}?action=role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  })
  toast.success("Role updated successfully")
  return true
}

async function deleteUser(userId: string): Promise<boolean> {
  await apiRequest(`/api/admin/users/${userId}`, {
    method: "DELETE",
  })
  toast.success("User account deleted. Email confirmation sent.")
  return true
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<ProfileWithWallet | null>(
    null
  )
  const [actionDialog, setActionDialog] = useState<"status" | "role" | "delete" | null>(
    null
  )
  const [selectedRole, setSelectedRole] = useState("")

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  })

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: fetchRoles,
  })

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      updateUserStatus(userId, status),
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["admin-users"] })
        setSelectedUser(null)
        setActionDialog(null)
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update status")
    },
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["admin-users"] })
        setSelectedUser(null)
        setActionDialog(null)
        setSelectedRole("")
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update role")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["admin-users"] })
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] })
        setSelectedUser(null)
        setActionDialog(null)
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to delete user")
    },
  })

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.phone && user.phone.includes(searchQuery))

        const matchesStatus =
          statusFilter === "all" || user.status === statusFilter

        const matchesRole = roleFilter === "all" || user.role === roleFilter

        return matchesSearch && matchesStatus && matchesRole
      }),
    [roleFilter, searchQuery, statusFilter, users]
  )
  const totalPages = Math.max(
    Math.ceil(filteredUsers.length / USERS_PAGE_SIZE),
    1
  )
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * USERS_PAGE_SIZE,
    page * USERS_PAGE_SIZE
  )

  const handleStatusAction = (user: ProfileWithWallet) => {
    setSelectedUser(user)
    setActionDialog("status")
  }

  const handleRoleAction = (user: ProfileWithWallet) => {
    setSelectedUser(user)
    setSelectedRole(user.role)
    setActionDialog("role")
  }

  const handleDeleteAction = (user: ProfileWithWallet) => {
    setSelectedUser(user)
    setActionDialog("delete")
  }

  const confirmStatusChange = () => {
    if (!selectedUser) return

    const newStatus = selectedUser.status === "active" ? "suspended" : "active"
    statusMutation.mutate({ userId: selectedUser.id, status: newStatus })
  }

  const confirmRoleChange = () => {
    if (!selectedUser || !selectedRole) return

    roleMutation.mutate({ userId: selectedUser.id, role: selectedRole })
  }

  const confirmDeleteUser = () => {
    if (!selectedUser) return

    deleteMutation.mutate(selectedUser.id)
  }

  if (usersLoading) {
    return <AdminPageSkeleton variant="table" />
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Users"
        title="User management"
        description="Search members, monitor balances, suspend accounts, and assign roles."
      />

      <Card className="fintech-surface rounded-[1.35rem]">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <div className="grid gap-3 sm:grid-cols-[1fr_10rem_10rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by name, email, or phone"
                className="h-10 rounded-xl pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-xl">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto thin-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Locked</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-semibold">
                      {user.full_name || "N/A"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.phone || "-"}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(user.wallets?.[0]?.balance || 0)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(user.wallets?.[0]?.locked_balance || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "admin"
                            ? "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-400/15 dark:bg-purple-400/10 dark:text-purple-200"
                            : ""
                        }
                      >
                        {roles.find((r) => r.name === user.role)
                          ?.display_name || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.status === "active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-200"
                            : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/15 dark:bg-rose-400/10 dark:text-rose-200"
                        }
                      >
                        {user.status === "active" ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusAction(user)}
                          className="rounded-xl"
                        >
                          {user.status === "active" ? (
                            <>
                              <UserX className="size-3.5" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="size-3.5" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleAction(user)}
                          className="rounded-xl"
                        >
                          <Shield className="size-3.5" />
                          Role
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAction(user)}
                          className="rounded-xl"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No users found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length > USERS_PAGE_SIZE ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Page {page} of {totalPages} -{" "}
                {filteredUsers.length.toLocaleString("en-NG")} users
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(current + 1, totalPages))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      <Dialog
        open={actionDialog === "status"}
        onOpenChange={(open) => !open && setActionDialog(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.status === "active"
                ? "Suspend User"
                : "Activate User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.status === "active"
                ? `Are you sure you want to suspend ${selectedUser?.full_name}? They will not be able to access their account.`
                : `Are you sure you want to activate ${selectedUser?.full_name}? They will regain access to their account.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={statusMutation.isPending}
              variant={
                selectedUser?.status === "active" ? "destructive" : "default"
              }
              className="rounded-xl"
            >
              {statusMutation.isPending
                ? "Processing..."
                : selectedUser?.status === "active"
                  ? "Suspend"
                  : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={actionDialog === "delete"}
        onOpenChange={(open) => !open && setActionDialog(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive sm:mx-0">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle>Delete User Account</DialogTitle>
            <DialogDescription>
              This will permanently delete {selectedUser?.full_name || selectedUser?.email}
              {" "}and remove their wallet, transactions, contribution plans, and notifications.
              The user will receive an email only after the delete request succeeds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteUser}
              disabled={deleteMutation.isPending}
              variant="destructive"
              className="rounded-xl"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog
        open={actionDialog === "role"}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialog(null)
            setSelectedRole("")
          }
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.full_name} (
              {selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 px-6 py-4">
            <div className="grid gap-2">
              <Label>Select Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog(null)
                setSelectedRole("")
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRoleChange}
              disabled={roleMutation.isPending || !selectedRole}
              className="rounded-xl"
            >
              {roleMutation.isPending ? "Saving..." : "Save Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
