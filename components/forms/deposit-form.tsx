"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowDownLeft } from "lucide-react"
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
import { depositSchema, type DepositSchema, type DepositValues } from "@/schemas/auth"

type DepositInitializeResponse = {
  reference: string
  authorizationUrl: string
}

export function DepositForm({ framed = true }: { framed?: boolean }) {
  const form = useForm<DepositSchema, unknown, DepositValues>({
    resolver: zodResolver(depositSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      amount: "",
      source: "",
    },
  })

  const onSubmit = async (data: DepositValues) => {
    try {
      const response = await apiRequest<DepositInitializeResponse>(
        "/api/wallet/deposit/initialize",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      )

      toast.success("Redirecting to Paystack checkout.")
      window.location.assign(response.authorizationUrl)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to start deposit"
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
              hint="Minimum deposit is NGN 500."
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
          name="source"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormFieldShell
              label="Funding source"
              error={fieldState.error?.message}
              hint="Paystack will show available payment options at checkout."
            >
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-12 w-full rounded-xl bg-card/75 px-4">
                  <SelectValue placeholder="Choose funding source" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="bank-transfer">Bank transfer</SelectItem>
                  <SelectItem value="debit-card">Debit card</SelectItem>
                  <SelectItem value="ussd">USSD</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldShell>
          )}
        />

        <SubmitButton
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText="Validating..."
        >
          Continue deposit
        </SubmitButton>
      </FieldGroup>
    </form>
  )

  if (!framed) return content

  return (
    <FormCard
      title="Deposit funds"
      description="Validate a wallet top-up before connecting payments."
      icon={<ArrowDownLeft className="size-5" />}
    >
      {content}
    </FormCard>
  )
}
