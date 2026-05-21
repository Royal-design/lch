import { requireActiveUser } from "@/lib/auth-server"
import { createSystemNotification } from "@/lib/notifications"
import { readRequestBody } from "@/lib/request-body"
import { withdrawalRequestSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const context = await requireActiveUser()

  if (context.error || !context.user || !context.profile) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const body = await readRequestBody(request)
  const validationResult = withdrawalRequestSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { amount, bankName, accountNumber, accountName, reason } =
    validationResult.data
  const { data, error } = await context.supabase.rpc("request_wallet_withdrawal", {
    p_amount: amount,
    p_bank_name: bankName,
    p_account_number: accountNumber,
    p_account_name: accountName,
    p_reason: reason || null,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message || "Unable to request withdrawal" },
      { status: 400 }
    )
  }

  await createSystemNotification({
    userId: context.user.id,
    title: "Withdrawal request received",
    message: `Your withdrawal request of NGN ${amount.toLocaleString(
      "en-NG"
    )} is pending admin review.`,
    email: {
      to: context.profile.email,
      subject: "Your LCH withdrawal request was received",
    },
  })

  return NextResponse.json(data, { status: 201 })
}
