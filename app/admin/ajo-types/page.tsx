"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ListChecks, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
  AdminPageHeader,
  AdminPageSkeleton,
  StatusBadge,
} from "@/components/admin/admin-ui"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"

type AjoType = {
  id: string
  name: string
  plan_name: string
  description: string | null
  target_amount: number
  min_contribution: number
  frequency: string
  withdrawal_access: string
  lock_duration_months: number
  member_limit: number
  status: string
}

type AjoTypeInput = Omit<AjoType, "id">

const defaultForm: AjoTypeInput = {
  name: "",
  plan_name: "",
  description: "",
  target_amount: 500000,
  min_contribution: 5000,
  frequency: "monthly",
  withdrawal_access: "owner-controlled",
  lock_duration_months: 6,
  member_limit: 20,
  status: "active",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

async function fetchAjoTypes(): Promise<AjoType[]> {
  const { data, error } = await supabase
    .from("ajo_types")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

async function createAjoType(input: AjoTypeInput) {
  const { error } = await supabase.from("ajo_types").insert({
    ...input,
    name: input.name.toLowerCase().trim().replace(/\s+/g, "_"),
    description: input.description || null,
  })

  if (error) {
    throw error
  }
}

export default function AdminAjoTypesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<AjoTypeInput>(defaultForm)

  const { data: ajoTypes = [], isLoading } = useQuery({
    queryKey: ["admin-ajo-types"],
    queryFn: fetchAjoTypes,
  })

  const createMutation = useMutation({
    mutationFn: createAjoType,
    onSuccess: () => {
      toast.success("Ajo type created. Users can now join it.")
      queryClient.invalidateQueries({ queryKey: ["admin-ajo-types"] })
      queryClient.invalidateQueries({ queryKey: ["ajo-types"] })
      setForm(defaultForm)
      setOpen(false)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to create Ajo type"
      )
    },
  })

  const handleCreate = () => {
    if (!form.name || !form.plan_name) {
      toast.error("Type name and plan name are required")
      return
    }

    createMutation.mutate(form)
  }

  if (isLoading) return <AdminPageSkeleton variant="cards" />

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          eyebrow="Ajo Types"
          title="Joinable Ajo setup"
          description="Create the Ajo categories users can join, with plan names, contribution rules, lock periods, and member limits."
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 rounded-xl">
              <Plus className="size-4" />
              Create Ajo Type
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Create Ajo Type</DialogTitle>
              <DialogDescription>
                This becomes available on the user contribution page.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 px-6 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <Label>Type name</Label>
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="market women ajo"
                    className="rounded-xl"
                  />
                </label>
                <label className="grid gap-2">
                  <Label>Plan name</Label>
                  <Input
                    value={form.plan_name}
                    onChange={(event) =>
                      setForm({ ...form, plan_name: event.target.value })
                    }
                    placeholder="Market Women Circle"
                    className="rounded-xl"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <Label>Description</Label>
                <Input
                  value={form.description || ""}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Short description users will see"
                  className="rounded-xl"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <Label>Target amount</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.target_amount}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        target_amount: Number(event.target.value),
                      })
                    }
                    className="rounded-xl"
                  />
                </label>
                <label className="grid gap-2">
                  <Label>Minimum contribution</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.min_contribution}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        min_contribution: Number(event.target.value),
                      })
                    }
                    className="rounded-xl"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-2">
                  <Label>Frequency</Label>
                  <Select
                    value={form.frequency}
                    onValueChange={(value) =>
                      setForm({ ...form, frequency: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="grid gap-2">
                  <Label>Lock months</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.lock_duration_months}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        lock_duration_months: Number(event.target.value),
                      })
                    }
                    className="rounded-xl"
                  />
                </label>
                <label className="grid gap-2">
                  <Label>Member limit</Label>
                  <Input
                    type="number"
                    min={2}
                    value={form.member_limit}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        member_limit: Number(event.target.value),
                      })
                    }
                    className="rounded-xl"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <Label>Withdrawal rule</Label>
                <Select
                  value={form.withdrawal_access}
                  onValueChange={(value) =>
                    setForm({ ...form, withdrawal_access: value })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anytime">Anytime withdrawal</SelectItem>
                    <SelectItem value="maturity">Only at maturity</SelectItem>
                    <SelectItem value="owner-controlled">
                      Owner controlled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="rounded-xl"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ajoTypes.map((ajoType) => (
          <Card key={ajoType.id} className="fintech-surface rounded-[1.35rem]">
            <CardHeader>
              <CardTitle className="flex items-start justify-between gap-3">
                <span>{ajoType.plan_name}</span>
                <StatusBadge status={ajoType.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-accent text-primary">
                  <ListChecks className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{ajoType.name}</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {ajoType.description || "No description yet."}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="font-bold">{formatCurrency(ajoType.target_amount)}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                  <p className="text-xs text-muted-foreground">Minimum</p>
                  <p className="font-bold">
                    {formatCurrency(ajoType.min_contribution)}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                  <p className="text-xs text-muted-foreground">Frequency</p>
                  <p className="font-bold capitalize">{ajoType.frequency}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="font-bold">{ajoType.member_limit}</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                {ajoType.lock_duration_months} month lock ·{" "}
                {ajoType.withdrawal_access.replace("-", " ")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {ajoTypes.length === 0 ? (
        <Card className="fintech-surface rounded-[1.35rem]">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No Ajo types yet. Create one so users can join from their
            contributions page.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
