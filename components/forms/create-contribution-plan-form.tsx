"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  contributionPlanSchema,
  type ContributionPlanSchema,
  type ContributionPlanValues,
} from "@/schemas/auth"

export function CreateContributionPlanForm({ framed = true }: { framed?: boolean }) {
  const form = useForm<ContributionPlanSchema, unknown, ContributionPlanValues>({
    resolver: zodResolver(contributionPlanSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      planType: "ajo",
      planName: "",
      targetAmount: "",
      frequency: "monthly",
      withdrawalAccess: "owner-controlled",
      lockDuration: "6",
      description: "",
    },
  })

  const onSubmit = async (data: ContributionPlanValues) => {
    await new Promise((resolve) => setTimeout(resolve, 700))
    toast.success(`${data.planName} plan is ready to create in Week 2.`)
  }

  const content = (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="planType"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormFieldShell
              label="Plan type"
              error={fieldState.error?.message}
              hint="Ajo plans can follow the owner's rules."
            >
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-12 w-full rounded-xl bg-card/75 px-4">
                  <SelectValue placeholder="Choose plan type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ajo">Ajo group</SelectItem>
                  <SelectItem value="personal">Personal savings</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldShell>
          )}
        />

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
                <Select value={field.value} onValueChange={field.onChange}>
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
                <Select value={field.value} onValueChange={field.onChange}>
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
      description="Set a savings target with owner-defined Ajo rules."
      icon={<Landmark className="size-5" />}
    >
      {content}
    </FormCard>
  )
}
