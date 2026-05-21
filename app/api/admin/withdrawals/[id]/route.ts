import { requireAdmin } from "@/lib/auth-server"
import { createSystemNotification } from "@/lib/notifications"
import { readRequestBody } from "@/lib/request-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const withdrawalActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(160).optional(),
})

type RouteContext = {
  params: Promise<{ id: string }>
}

type WithdrawalResult = {
  withdrawal?: {
    user_id?: string
    amount?: number
    status?: string
    reference?: string
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin()

  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: "Admin service client is not configured" },
      { status: 500 }
    )
  }

  const body = await readRequestBody(request)
  const validationResult = withdrawalActionSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { id } = await context.params
  const { action, reason } = validationResult.data
  const rpc =
    action === "approve"
      ? supabase.rpc("approve_wallet_withdrawal", {
          p_transaction_id: id,
        })
      : supabase.rpc("reject_wallet_withdrawal", {
          p_transaction_id: id,
          p_reason: reason || null,
        })
  const { data, error } = await rpc

  if (error) {
    return NextResponse.json(
      { error: error.message || "Unable to update withdrawal" },
      { status: 400 }
    )
  }

  const result = data as WithdrawalResult
  const userId = result.withdrawal?.user_id
  const amount = Number(result.withdrawal?.amount ?? 0)

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle()

    if (profile?.email) {
      await createSystemNotification({
        userId,
        title:
          action === "approve"
            ? "Withdrawal approved"
            : "Withdrawal rejected",
        message:
          action === "approve"
            ? `Your withdrawal of NGN ${amount.toLocaleString(
                "en-NG"
              )} has been approved.`
            : `Your withdrawal of NGN ${amount.toLocaleString(
                "en-NG"
              )} was rejected.${reason ? ` Reason: ${reason}` : ""}`,
        email: {
          to: profile.email,
          subject:
            action === "approve"
              ? "Your LCH withdrawal was approved"
              : "Your LCH withdrawal was rejected",
        },
      })
    }
  }

  return NextResponse.json(data)
}
