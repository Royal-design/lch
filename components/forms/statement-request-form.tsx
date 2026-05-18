"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ReceiptText } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import {
  FormCard,
  FormFieldShell,
  SubmitButton,
} from "@/components/forms/form-system"
import { FieldGroup } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const statementSchema = z.object({
  period: z.string().min(1, "Choose a statement period"),
  format: z.string().min(1, "Choose a format"),
})

type StatementSchema = z.infer<typeof statementSchema>

export function StatementRequestForm({ framed = true }: { framed?: boolean }) {
  const form = useForm<StatementSchema>({
    resolver: zodResolver(statementSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      period: "30-days",
      format: "pdf",
    },
  })

  const onSubmit = async (data: StatementSchema) => {
    await new Promise((resolve) => setTimeout(resolve, 550))
    toast.success(`Statement ${data.format.toUpperCase()} prepared for ${data.period.replace("-", " ")}.`)
  }

  const content = (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="period"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormFieldShell label="Period" error={fieldState.error?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-12 w-full rounded-xl bg-card/75 px-4">
                  <SelectValue placeholder="Choose period" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="7-days">Last 7 days</SelectItem>
                  <SelectItem value="30-days">Last 30 days</SelectItem>
                  <SelectItem value="90-days">Last 90 days</SelectItem>
                  <SelectItem value="12-months">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldShell>
          )}
        />

        <Controller
          name="format"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormFieldShell label="Format" error={fieldState.error?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-12 w-full rounded-xl bg-card/75 px-4">
                  <SelectValue placeholder="Choose format" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldShell>
          )}
        />

        <SubmitButton
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText="Preparing..."
        >
          Prepare statement
        </SubmitButton>
      </FieldGroup>
    </form>
  )

  if (!framed) return content

  return (
    <FormCard
      title="Request statement"
      description="Prepare a wallet and contribution statement."
      icon={<ReceiptText className="size-5" />}
    >
      {content}
    </FormCard>
  )
}
