"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  addContributionSchema,
  type AddContributionSchema,
  type AddContributionValues,
} from "@/schemas/auth"

export function AddContributionForm({ framed = true }: { framed?: boolean }) {
  const form = useForm<AddContributionSchema, unknown, AddContributionValues>({
    resolver: zodResolver(addContributionSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      amount: "",
      planId: "",
    },
  })

  const onSubmit = async (data: AddContributionValues) => {
    await new Promise((resolve) => setTimeout(resolve, 650))
    toast.success(`Contribution of NGN ${data.amount.toLocaleString("en-NG")} validated.`)
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
              hint="Choose where this money should be recorded."
            >
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-12 w-full rounded-xl bg-card/75 px-4">
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="family-ajo">Family Ajo Circle</SelectItem>
                  <SelectItem value="rent">Rent Savings</SelectItem>
                  <SelectItem value="business">Business Capital</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldShell>
          )}
        />

        <SubmitButton
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText="Recording..."
        >
          Add contribution
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
