import { requireActiveUser } from "@/lib/auth-server"
import { createSystemNotification } from "@/lib/notifications"
import { verifyPaystackTransaction } from "@/lib/paystack"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

type CompleteDepositResult = {
  amount?: number
  already_credited?: boolean
  status?: string
}

export async function GET(request: NextRequest) {
  const context = await requireActiveUser()

  if (context.error || !context.user || !context.profile) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const reference = request.nextUrl.searchParams.get("reference")

  if (!reference) {
    return NextResponse.json(
      { error: "Payment reference is required" },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: "Admin service client is not configured" },
      { status: 500 }
    )
  }

  const { data: transaction } = await supabase
    .from("transactions")
    .select("user_id, status")
    .eq("reference", reference)
    .eq("provider", "paystack")
    .maybeSingle()

  if (!transaction || transaction.user_id !== context.user.id) {
    return NextResponse.json(
      { error: "Deposit request was not found" },
      { status: 404 }
    )
  }

  const payment = await verifyPaystackTransaction(reference)

  if (payment.status !== "success") {
    await supabase
      .from("transactions")
      .update({
        status: payment.status === "failed" ? "failed" : "processing",
        gateway_response: payment.gateway_response,
        metadata: payment.metadata ?? {},
      })
      .eq("reference", reference)
      .neq("status", "successful")

    return NextResponse.json({
      status: payment.status,
      message: "Payment has not been completed yet",
    })
  }

  const { data, error } = await supabase.rpc("complete_wallet_deposit", {
    p_reference: reference,
    p_provider_reference: payment.reference,
    p_provider_transaction_id: String(payment.id),
    p_channel: payment.channel,
    p_gateway_response: payment.gateway_response,
    p_paid_at: payment.paid_at,
    p_metadata: payment.metadata ?? {},
  })

  if (error) {
    return NextResponse.json(
      { error: "Unable to credit wallet deposit" },
      { status: 500 }
    )
  }

  const result = data as CompleteDepositResult

  if (!result.already_credited) {
    await createSystemNotification({
      userId: context.user.id,
      title: "Wallet deposit successful",
      message: `Your wallet has been credited with NGN ${Number(
        result.amount ?? 0
      ).toLocaleString("en-NG")}.`,
      email: {
        to: context.profile.email,
        subject: "Your LCH wallet deposit was successful",
      },
    })
  }

  return NextResponse.json({
    status: result.status ?? "successful",
    reference,
    amount: result.amount,
    alreadyCredited: Boolean(result.already_credited),
  })
}
