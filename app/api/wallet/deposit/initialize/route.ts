import { requireActiveUser } from "@/lib/auth-server"
import { initializePaystackTransaction } from "@/lib/paystack"
import { readRequestBody } from "@/lib/request-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { depositSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

function createDepositReference() {
  return `LCH-DEP-${Date.now()}-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`
}

function getAppUrl(request: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.nextUrl.origin
  )
}

export async function POST(request: NextRequest) {
  const context = await requireActiveUser()

  if (context.error || !context.user || !context.profile) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const body = await readRequestBody(request)
  const validationResult = depositSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
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

  const { amount, source } = validationResult.data
  const reference = createDepositReference()
  const appUrl = getAppUrl(request)
  const callbackUrl = `${appUrl}/dashboard/wallet/deposit/callback?reference=${encodeURIComponent(reference)}`

  const { error: transactionError } = await supabase.from("transactions").insert({
    user_id: context.user.id,
    type: "deposit",
    amount,
    status: "pending",
    reference,
    description: "Wallet deposit via Paystack",
    provider: "paystack",
    provider_reference: reference,
    currency: "NGN",
    channel: source,
    metadata: {
      source,
      purpose: "wallet_deposit",
    },
  })

  if (transactionError) {
    return NextResponse.json(
      { error: "Unable to create deposit request" },
      { status: 500 }
    )
  }

  try {
    const paystackTransaction = await initializePaystackTransaction({
      email: context.profile.email,
      amount: Math.round(amount * 100),
      reference,
      callback_url: callbackUrl,
      metadata: {
        userId: context.user.id,
        purpose: "wallet_deposit",
        source,
      },
    })

    return NextResponse.json({
      reference,
      authorizationUrl: paystackTransaction.authorization_url,
      accessCode: paystackTransaction.access_code,
    })
  } catch (error) {
    await supabase
      .from("transactions")
      .update({ status: "failed" })
      .eq("reference", reference)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to initialize Paystack payment",
      },
      { status: 500 }
    )
  }
}
