"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowUpRight } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import {
  FormCard,
  FormFieldShell,
  FormInput,
  SubmitButton,
  formatCurrencyInput,
} from "@/components/forms/form-system"
import { FieldGroup } from "@/components/ui/field"
import { apiRequest } from "@/lib/api-client"
import {
  withdrawalRequestSchema,
  type WithdrawalRequestSchema,
  type WithdrawalRequestValues,
} from "@/schemas/auth"

function parseAmount(value: string) {
  return Number(value.replace(/[^\d.]/g, ""))
}

export function WithdrawalRequestForm({ framed = true }: { framed?: boolean }) {
  const queryClient = useQueryClient()
  const form = useForm<WithdrawalRequestSchema, unknown, WithdrawalRequestValues>({
    resolver: zodResolver(withdrawalRequestSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      amount: "",
      bankName: "",
      accountNumber: "",
      accountName: "",
      reason: "",
    },
  })

  const watchedAmount = useWatch({
    control: form.control,
    name: "amount",
  })
  const amount = parseAmount(String(watchedAmount ?? ""))

  const onSubmit = async (data: WithdrawalRequestValues) => {
    try {
      await apiRequest("/api/wallet/withdrawals", {
        method: "POST",
        body: JSON.stringify(data),
      })
      toast.success(
        `Withdrawal request for NGN ${data.amount.toLocaleString(
          "en-NG"
        )} submitted.`
      )
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      form.reset()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to request withdrawal"
      )
    }
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
              hint="Funds are reserved while an admin reviews the request."
              inputMode="numeric"
              placeholder="NGN 50,000"
              value={field.value ? `NGN ${field.value}` : ""}
              onChange={(event) =>
                field.onChange(formatCurrencyInput(event.target.value))
              }
            />
          )}
        />

        {amount > 0 ? (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p className="font-medium">
              Make sure these bank details are correct before submitting.
            </p>
          </div>
        ) : null}

        <Controller
          name="bankName"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              label="Bank name"
              error={fieldState.error?.message}
              placeholder="OPay, GTBank, Access Bank"
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="accountNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              label="Account number"
              error={fieldState.error?.message}
              inputMode="numeric"
              maxLength={10}
              placeholder="0123456789"
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="accountName"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              label="Account name"
              error={fieldState.error?.message}
              placeholder="Account holder name"
              autoComplete="off"
            />
          )}
        />

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
          loadingText="Submitting..."
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
      description="Reserve wallet funds while an admin reviews your payout request."
      icon={<ArrowUpRight className="size-5" />}
    >
      {content}
    </FormCard>
  )
}
