"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  FormCard,
  FormFieldShell,
  FormInput,
  SubmitButton,
  formatCurrencyInput,
} from "@/components/forms/form-system"
import { FieldGroup } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiRequest } from "@/lib/api-client"
import {
  addContributionSchema,
  type AddContributionSchema,
  type AddContributionValues,
} from "@/schemas/auth"

type ContributionPlan = {
  id: string
  title: string
  target_amount: number
  saved_amount: number
  status: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

async function fetchContributionPlans() {
  const data = await apiRequest<{ plans: ContributionPlan[] }>(
    "/api/contribution-plans"
  )
  return data.plans
}

export function AddContributionForm({ framed = true }: { framed?: boolean }) {
  const queryClient = useQueryClient()
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["contribution-plans"],
    queryFn: fetchContributionPlans,
  })
  const form = useForm<AddContributionSchema, unknown, AddContributionValues>({
    resolver: zodResolver(addContributionSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      amount: "",
      planId: "",
    },
  })

  const fundablePlans = plans.filter((plan) => {
    const savedAmount = Number(plan.saved_amount) || 0
    const targetAmount = Number(plan.target_amount) || 0

    return plan.status === "active" && savedAmount < targetAmount
  })

  const onSubmit = async (data: AddContributionValues) => {
    await apiRequest(`/api/contribution-plans/${data.planId}/funds`, {
      method: "POST",
      body: JSON.stringify({ amount: data.amount }),
    })
    toast.success(
      `Contribution of NGN ${data.amount.toLocaleString("en-NG")} added.`
    )
    queryClient.invalidateQueries({ queryKey: ["contribution-plans"] })
    queryClient.invalidateQueries({ queryKey: ["contributions"] })
    queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
    form.reset()
  }

  const content = (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              label="Amount"
              error={fieldState.error?.message}
              hint="Minimum contribution is NGN 500."
              inputMode="numeric"
              placeholder="NGN 25,000"
              value={field.value ? `NGN ${field.value}` : ""}
              onChange={(event) =>
                field.onChange(formatCurrencyInput(event.target.value))
              }
            />
          )}
        />

        <Controller
          name="planId"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormFieldShell
              label="Contribution plan"
              error={fieldState.error?.message}
              hint="Joined Ajo and personal plans appear here."
            >
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-12 w-full rounded-xl bg-card/75 px-4">
                  <SelectValue
                    placeholder={
                      isLoading ? "Loading plans..." : "Choose a plan"
                    }
                  />
                </SelectTrigger>
                <SelectContent position="popper">
                  {fundablePlans.map((plan) => {
                    const savedAmount = Number(plan.saved_amount) || 0
                    const targetAmount = Number(plan.target_amount) || 0
                    const remainingAmount = targetAmount - savedAmount

                    return (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.title} · {formatCurrency(remainingAmount)} left
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </FormFieldShell>
          )}
        />

        <SubmitButton
          type="submit"
          disabled={isLoading || fundablePlans.length === 0}
          loading={form.formState.isSubmitting}
          loadingText="Recording..."
        >
          {fundablePlans.length === 0 && !isLoading
            ? "No active plans"
            : "Add contribution"}
        </SubmitButton>
      </FieldGroup>
    </form>
  )

  if (!framed) return content

  return (
    <FormCard
      title="Add contribution"
      description="Record a contribution into an active savings plan."
      icon={<Plus className="size-5" />}
    >
      {content}
    </FormCard>
  )
}
