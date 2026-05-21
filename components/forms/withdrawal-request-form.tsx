"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowUpRight, Search, Check, ChevronDown, Loader2 } from "lucide-react"
import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
  FormCard,
  FormFieldShell,
  FormInput,
  SubmitButton,
  formatCurrencyInput,
} from "@/components/forms/form-system"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { apiRequest } from "@/lib/api-client"
import { cn } from "@/lib/utils"
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
  const [bankSearchQuery, setBankSearchQuery] = React.useState("")
  const [isBankDropdownOpen, setIsBankDropdownOpen] = React.useState(false)
  const [resolvingAccount, setResolvingAccount] = React.useState(false)
  const [resolveError, setResolveError] = React.useState<string | null>(null)
  const [resolvedName, setResolvedName] = React.useState<string>("")

  const form = useForm<WithdrawalRequestSchema, unknown, WithdrawalRequestValues>({
    resolver: zodResolver(withdrawalRequestSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      amount: "",
      bankName: "",
      bankCode: "",
      accountNumber: "",
      accountName: "",
      reason: "",
    },
  })

  // Fetch bank list
  const { data: banks = [], isLoading: isLoadingBanks } = useQuery({
    queryKey: ["banks"],
    queryFn: async () => {
      const data = await apiRequest<{ banks: { name: string; code: string }[] }>("/api/banks")
      return data.banks
    },
    staleTime: 12 * 60 * 60 * 1000, // cache for 12 hours
  })

  const watchedAmount = useWatch({
    control: form.control,
    name: "amount",
  })
  const amount = parseAmount(String(watchedAmount ?? ""))

  const watchedBankCode = useWatch({ control: form.control, name: "bankCode" })
  const watchedAccountNumber = useWatch({ control: form.control, name: "accountNumber" })

  // Account name auto-resolution effect
  React.useEffect(() => {
    let active = true
    const resolve = async () => {
      if (watchedAccountNumber?.length === 10 && watchedBankCode) {
        setResolvingAccount(true)
        setResolveError(null)
        try {
          const res = await apiRequest<{ accountName: string }>(
            `/api/banks/resolve?account_number=${watchedAccountNumber}&bank_code=${watchedBankCode}`
          )
          if (active) {
            form.setValue("accountName", res.accountName)
            setResolvedName(res.accountName)
            setResolveError(null)
          }
        } catch (error: any) {
          if (active) {
            const errorMsg = error instanceof Error ? error.message : "Could not resolve account name"
            setResolveError(errorMsg)
            form.setValue("accountName", "")
            setResolvedName("")
          }
        } finally {
          if (active) {
            setResolvingAccount(false)
          }
        }
      } else {
        if (active) {
          setResolveError(null)
          setResolvedName("")
          form.setValue("accountName", "")
        }
      }
    }

    resolve()
    return () => {
      active = false
    }
  }, [watchedAccountNumber, watchedBankCode, form])

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
      setResolvedName("")
      setResolveError(null)
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
          render={({ field, fieldState }) => {
            const filteredBanks = (banks || []).filter((bank) =>
              bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
            )

            return (
              <div className="relative">
                <FormFieldShell label="Bank name" error={fieldState.error?.message}>
                  <button
                    type="button"
                    onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                    className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-card/75 px-4 text-sm shadow-sm outline-none transition-all focus:border-primary/60 focus:ring-3 focus:ring-ring/20 text-left dark:bg-input/30"
                  >
                    <span className={field.value ? "text-foreground" : "text-muted-foreground"}>
                      {field.value || "Choose bank..."}
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </button>
                </FormFieldShell>

                {isBankDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => {
                        setIsBankDropdownOpen(false)
                        setBankSearchQuery("")
                      }}
                    />
                    <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-full rounded-2xl border border-border bg-popover p-2 shadow-lg shadow-slate-950/10 dark:shadow-slate-950/30">
                      <div className="relative mb-2 flex items-center border-b border-border/60 pb-1.5 px-1.5 pt-0.5">
                        <Search className="absolute left-3 size-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search bank..."
                          value={bankSearchQuery}
                          onChange={(e) => setBankSearchQuery(e.target.value)}
                          className="h-9 w-full bg-transparent pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground"
                          autoFocus
                        />
                      </div>
                      <ul className="max-h-48 overflow-y-auto space-y-0.5">
                        {isLoadingBanks ? (
                          <li className="px-2.5 py-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                            <Loader2 className="size-3 animate-spin text-primary" />
                            <span>Loading banks...</span>
                          </li>
                        ) : filteredBanks.length > 0 ? (
                          filteredBanks.map((bank) => (
                            <li
                              key={bank.code}
                              onClick={() => {
                                form.setValue("bankName", bank.name)
                                form.setValue("bankCode", bank.code)
                                setIsBankDropdownOpen(false)
                                setBankSearchQuery("")
                              }}
                              className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                              <span>{bank.name}</span>
                              {field.value === bank.name && <Check className="size-4 text-primary" />}
                            </li>
                          ))
                        ) : (
                          <li className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                            No banks found
                          </li>
                        )}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )
          }}
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
            <FormFieldShell label="Account name" error={fieldState.error?.message}>
              <div className="relative">
                <Input
                  {...field}
                  aria-invalid={Boolean(fieldState.error)}
                  placeholder={resolvingAccount ? "Resolving name..." : "Account holder name"}
                  autoComplete="off"
                  readOnly
                  disabled={resolvingAccount || !watchedBankCode}
                  className={cn(
                    "h-12 rounded-xl px-4 bg-muted/20 cursor-not-allowed",
                    resolvedName && "border-emerald-500/40 focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20",
                    resolveError && "border-rose-500/40 focus-visible:border-rose-500/60 focus-visible:ring-rose-500/20"
                  )}
                />
                {resolvingAccount && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                )}
                {resolvedName && !resolvingAccount && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-emerald-500">
                    <Check className="size-4" />
                  </div>
                )}
              </div>
              {resolvedName && !resolvingAccount && (
                <p className="mt-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Verified Account: {resolvedName}
                </p>
              )}
              {resolveError && !resolvingAccount && (
                <p className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {resolveError}
                </p>
              )}
            </FormFieldShell>
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
          disabled={resolvingAccount || !resolvedName || form.formState.isSubmitting}
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
