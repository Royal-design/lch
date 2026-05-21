"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"

type DepositVerifyResponse = {
  status: string
  reference: string
  amount?: number
  alreadyCredited?: boolean
  message?: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function DepositCallbackPage() {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const reference = searchParams.get("reference") ?? ""

  const { data, error, isLoading } = useQuery({
    queryKey: ["wallet-deposit-verify", reference],
    queryFn: () =>
      apiRequest<DepositVerifyResponse>(
        `/api/wallet/deposit/verify?reference=${encodeURIComponent(reference)}`
      ),
    enabled: Boolean(reference),
    retry: 1,
  })

  useEffect(() => {
    if (data?.status !== "successful") return

    queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    queryClient.invalidateQueries({ queryKey: ["notifications"] })
  }, [data?.status, queryClient])

  const isSuccessful = data?.status === "successful"
  const isPending = data && data.status !== "successful"

  return (
    <div className="mx-auto grid min-h-[65svh] max-w-xl place-items-center px-4">
      <Card className="fintech-surface w-full rounded-[1.35rem]">
        <CardContent className="p-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-muted">
            {isLoading ? (
              <Loader2 className="size-6 animate-spin text-primary" />
            ) : isSuccessful ? (
              <CheckCircle2 className="size-7 text-emerald-600" />
            ) : (
              <XCircle className="size-7 text-rose-600" />
            )}
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight">
            {isLoading
              ? "Confirming deposit"
              : isSuccessful
                ? "Wallet funded"
                : "Deposit not completed"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isLoading
              ? "We are verifying your Paystack payment before crediting your wallet."
              : isSuccessful
                ? `Your wallet ${data.alreadyCredited ? "was already credited" : "has been credited"}${
                    data.amount ? ` with ${formatCurrency(data.amount)}` : ""
                  }.`
                : isPending
                  ? data.message || "Paystack has not confirmed this payment yet."
                  : error instanceof Error
                    ? error.message
                    : "We could not verify this payment reference."}
          </p>

          {reference ? (
            <p className="mt-3 break-all rounded-xl bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
              {reference}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-xl">
              <Link href="/dashboard/wallet">Back to wallet</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
