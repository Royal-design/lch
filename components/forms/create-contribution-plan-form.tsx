"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Landmark } from "lucide-react"
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
  contributionPlanSchema,
  type ContributionPlanSchema,
  type ContributionPlanValues,
} from "@/schemas/auth"

export function CreateContributionPlanForm({
  framed = true,
  onSuccess,
}: {
  framed?: boolean
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()
  const form = useForm<ContributionPlanSchema, unknown, ContributionPlanValues>({
    resolver: zodResolver(contributionPlanSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      planType: "personal",
      planName: "",
      targetAmount: "",
      frequency: "monthly",
      withdrawalAccess: "owner-controlled",
      lockDuration: "6",
      description: "",
    },
  })

  const onSubmit = async (data: ContributionPlanValues) => {
    try {
      await apiRequest("/api/contribution-plans", {
        method: "POST",
        body: JSON.stringify(data),
      })
      toast.success(`${data.planName} plan created.`)
      queryClient.invalidateQueries({ queryKey: ["contribution-plans"] })
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.message || "Failed to create plan. Please try again.")
    }
  }

  const content = (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="planName"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              label="Plan name"
              error={fieldState.error?.message}
              placeholder="Family Ajo Circle"
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="targetAmount"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              label="Target amount"
              error={fieldState.error?.message}
              hint="Enter the full amount this plan should reach."
              inputMode="numeric"
              placeholder="NGN 800,000"
              value={field.value ? `NGN ${field.value}` : ""}
              onChange={(event) =>
                field.onChange(formatCurrencyInput(event.target.value))
              }
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="frequency"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormFieldShell
                label="Frequency"
                error={fieldState.error?.message}
              >
                <Select
                  value={String(field.value ?? "")}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl bg-card/75 px-4">
                    <SelectValue placeholder="Choose frequency" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </FormFieldShell>
            )}
          />

          <Controller
            name="lockDuration"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormFieldShell
                label="Lock preference"
                error={fieldState.error?.message}
              >
                <Select
                  value={String(field.value ?? "")}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl bg-card/75 px-4">
                    <SelectValue placeholder="Choose preference" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="1">Flexible / 1 month</SelectItem>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </FormFieldShell>
            )}
          />
        </div>

        <Controller
          name="withdrawalAccess"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormFieldShell
              label="Withdrawal access"
              error={fieldState.error?.message}
              hint="Set this based on how the owner wants the Ajo to work."
            >
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-12 w-full rounded-xl bg-card/75 px-4">
                  <SelectValue placeholder="Choose withdrawal rule" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="anytime">Anytime withdrawal</SelectItem>
                  <SelectItem value="maturity">Only at maturity</SelectItem>
                  <SelectItem value="owner-controlled">Owner controlled</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldShell>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormFieldShell
              label="Description"
              error={fieldState.error?.message}
              hint="Optional. Keep it short and useful."
            >
              <textarea
                {...field}
                className="min-h-24 w-full resize-none rounded-xl border border-input bg-card/75 px-4 py-3 text-sm shadow-sm shadow-slate-950/5 outline-none transition-all focus-visible:border-primary/60 focus-visible:ring-3 focus-visible:ring-ring/20 dark:bg-input/30"
                placeholder="What is this plan for?"
              />
            </FormFieldShell>
          )}
        />

        <SubmitButton
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText="Saving plan..."
        >
          Save plan
        </SubmitButton>
      </FieldGroup>
    </form>
  )

  if (!framed) return content

  return (
    <FormCard
      title="Create plan"
      description="Set a personal savings target. Join group Ajo plans from the marketplace."
      icon={<Landmark className="size-5" />}
    >
      {content}
    </FormCard>
  )
}
