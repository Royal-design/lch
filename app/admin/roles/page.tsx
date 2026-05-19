"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Shield, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { AdminPageHeader, AdminPageSkeleton } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiRequest } from "@/lib/api-client"
import { Badge } from "../../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"

interface Role {
  id: string
  name: string
  display_name: string
  description: string | null
  is_system: boolean
  created_at: string
  updated_at: string
}

async function fetchRoles(): Promise<Role[]> {
  const data = await apiRequest<{ roles: Role[] }>("/api/admin/roles")
  return data.roles
}

async function createRole(role: {
  name: string
  display_name: string
  description?: string
}): Promise<boolean> {
  await apiRequest("/api/admin/roles", {
    method: "POST",
    body: JSON.stringify(role),
  })
  toast.success("Role created successfully")
  return true
}

async function updateRole(role: {
  id: string
  display_name: string
  description?: string
}): Promise<boolean> {
  await apiRequest(`/api/admin/roles/${role.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      display_name: role.display_name,
      description: role.description,
    }),
  })
  toast.success("Role updated successfully")
  return true
}

async function deleteRole(id: string): Promise<boolean> {
  await apiRequest(`/api/admin/roles/${id}`, { method: "DELETE" })
  toast.success("Role deleted successfully")
  return true
}

export default function AdminRolesPage() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    display_name: "",
    description: "",
  })

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: fetchRoles,
  })

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
        setIsCreateOpen(false)
        setFormData({ name: "", display_name: "", description: "" })
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to create role")
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
        setEditingRole(null)
        setFormData({ name: "", display_name: "", description: "" })
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update role")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to delete role")
    },
  })

  const handleCreate = () => {
    if (!formData.name || !formData.display_name) {
      toast.error("Name and display name are required")
      return
    }

    createMutation.mutate({
      name: formData.name.toLowerCase().replace(/\s+/g, "_"),
      display_name: formData.display_name,
      description: formData.description || undefined,
    })
  }

  const handleUpdate = () => {
    if (!editingRole || !formData.display_name) {
      toast.error("Display name is required")
      return
    }

    updateMutation.mutate({
      id: editingRole.id,
      display_name: formData.display_name,
      description: formData.description || undefined,
    })
  }

  const handleDelete = (role: Role) => {
    if (role.is_system) {
      toast.error("Cannot delete system roles")
      return
    }

    if (
      confirm(
        `Are you sure you want to delete the "${role.display_name}" role?`
      )
    ) {
      deleteMutation.mutate(role.id)
    }
  }

  const openEditDialog = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || "",
    })
  }

  if (isLoading) {
    return <AdminPageSkeleton variant="table" />
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Roles"
        title="Role management"
        description="Create and manage user roles for access control. System roles cannot be deleted."
      />

      <Card className="fintech-surface rounded-[1.35rem]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Roles
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="size-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl p-4">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Add a new role that can be assigned to users.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., moderator"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use lowercase with underscores (e.g., content_manager)
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    placeholder="e.g., Moderator"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="rounded-xl"
                >
                  {createMutation.isPending ? "Creating..." : "Create Role"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto thin-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-mono text-sm">
                      {role.name}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {role.display_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || "-"}
                    </TableCell>
                    <TableCell>
                      {role.is_system ? (
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/15 dark:bg-blue-400/10 dark:text-blue-200"
                        >
                          System
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-400/15 dark:bg-slate-400/10 dark:text-slate-200"
                        >
                          Custom
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(role)}
                          className="rounded-xl"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(role)}
                          disabled={role.is_system}
                          className="rounded-xl"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No roles found. Create your first role to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingRole}
        onOpenChange={(open) => !open && setEditingRole(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role details. Role name cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 px-6 py-4">
            <div className="grid gap-2">
              <Label>Role Name</Label>
              <Input
                value={formData.name}
                disabled
                className="rounded-xl bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Role name cannot be changed after creation.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_display_name">Display Name</Label>
              <Input
                id="edit_display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_description">Description</Label>
              <Input
                id="edit_description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingRole(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="rounded-xl"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
