"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowUpRight } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
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
  withdrawalRequestSchema,
  type WithdrawalRequestSchema,
  type WithdrawalRequestValues,
} from "@/schemas/auth"

const availableBalance = 522500

function parseAmount(value: string) {
  return Number(value.replace(/[^\d.]/g, ""))
}

export function WithdrawalRequestForm({ framed = true }: { framed?: boolean }) {
  const form = useForm<WithdrawalRequestSchema, unknown, WithdrawalRequestValues>({
    resolver: zodResolver(withdrawalRequestSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      amount: "",
      reason: "",
    },
  })

  const watchedAmount = useWatch({
    control: form.control,
    name: "amount",
  })
  const amount = parseAmount(watchedAmount ?? "")
  const exceedsBalance = amount > availableBalance

  const onSubmit = async (data: WithdrawalRequestValues) => {
    await new Promise((resolve) => setTimeout(resolve, 650))
    toast.success(`Withdrawal request for NGN ${data.amount.toLocaleString("en-NG")} validated.`)
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
              hint="Available balance: NGN 522,500."
              inputMode="numeric"
              placeholder="NGN 50,000"
              value={field.value ? `NGN ${field.value}` : ""}
              onChange={(event) =>
                field.onChange(formatCurrencyInput(event.target.value))
              }
            />
          )}
        />

        {exceedsBalance ? (
          <div className="flex gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p className="font-medium">
              This request is above your available wallet balance.
            </p>
          </div>
        ) : null}

        <Controller
          name="reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormFieldShell
              label="Withdrawal reason"
              error={fieldState.error?.message}
              hint="Optional. Add context for your records."
            >
              <textarea
                {...field}
                className="min-h-24 w-full resize-none rounded-xl border border-input bg-card/75 px-4 py-3 text-sm shadow-sm shadow-slate-950/5 outline-none transition-all focus-visible:border-primary/60 focus-visible:ring-3 focus-visible:ring-ring/20 dark:bg-input/30"
                placeholder="Short note"
              />
            </FormFieldShell>
          )}
        />

        <SubmitButton
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText="Reviewing..."
          disabled={exceedsBalance}
        >
          Request withdrawal
        </SubmitButton>
      </FieldGroup>
    </form>
  )

  if (!framed) return content

  return (
    <FormCard
      title="Request withdrawal"
      description="Validate a withdrawal request before Week 2 API wiring."
      icon={<ArrowUpRight className="size-5" />}
    >
      {content}
    </FormCard>
  )
}
