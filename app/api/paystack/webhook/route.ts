import { createHmac, timingSafeEqual } from "crypto"
import { createSystemNotification } from "@/lib/notifications"
import type { PaystackWebhookEvent } from "@/lib/paystack"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

type CompleteDepositResult = {
  amount?: number
  already_credited?: boolean
}

function isValidPaystackSignature(body: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY

  if (!secret || !signature) return false

  const digest = createHmac("sha512", secret).update(body).digest("hex")
  const digestBuffer = Buffer.from(digest)
  const signatureBuffer = Buffer.from(signature)

  return (
    digestBuffer.length === signatureBuffer.length &&
    timingSafeEqual(digestBuffer, signatureBuffer)
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("x-paystack-signature")

  if (!isValidPaystackSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(body) as PaystackWebhookEvent

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: "Admin service client is not configured" },
      { status: 500 }
    )
  }

  const payment = event.data
  const { data, error } = await supabase.rpc("complete_wallet_deposit", {
    p_reference: payment.reference,
    p_provider_reference: payment.reference,
    p_provider_transaction_id: String(payment.id),
    p_channel: payment.channel,
    p_gateway_response: payment.gateway_response,
    p_paid_at: payment.paid_at,
    p_metadata: payment.metadata ?? {},
  })

  if (error) {
    console.error("Paystack webhook deposit completion failed", error)
    return NextResponse.json(
      { error: "Unable to complete deposit" },
      { status: 500 }
    )
  }

  const result = data as CompleteDepositResult

  if (!result.already_credited) {
    const { data: transaction } = await supabase
      .from("transactions")
      .select("user_id")
      .eq("reference", payment.reference)
      .maybeSingle()

    const { data: profile } = transaction?.user_id
      ? await supabase
          .from("profiles")
          .select("email")
          .eq("id", transaction.user_id)
          .maybeSingle()
      : { data: null }

    if (transaction?.user_id && profile?.email) {
      await createSystemNotification({
        userId: transaction.user_id,
        title: "Wallet deposit successful",
        message: `Your wallet has been credited with NGN ${Number(
          result.amount ?? 0
        ).toLocaleString("en-NG")}.`,
        email: {
          to: profile.email,
          subject: "Your LCH wallet deposit was successful",
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
