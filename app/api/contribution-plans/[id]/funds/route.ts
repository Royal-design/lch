import { requireActiveUser } from "@/lib/auth-server"
import { sendNotificationEmail } from "@/lib/notifications"
import { readRequestBody } from "@/lib/request-body"
import { addContributionSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireActiveUser()

  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await context.params
  const body = await readRequestBody(request)
  const validationResult = addContributionSchema.safeParse({
    ...body,
    planId: id,
  })

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { amount } = validationResult.data
  const { data, error } = await auth.supabase.rpc("record_plan_contribution", {
    p_plan_id: id,
    p_amount: amount,
  })

  if (error) {
    const message = error.message || "Unable to record this contribution"
    const status =
      message.includes("not found") ? 404 : message.includes("active") ? 400 : 500

    return NextResponse.json({ error: message }, { status })
  }

  if (isContributionResponse(data) && auth.profile?.email) {
    const isCompleted = data.plan.status === "completed"
    const formattedAmount = formatCurrency(amount)

    await sendNotificationEmail({
      to: auth.profile.email,
      subject: isCompleted
        ? "Your LCH contribution plan is complete"
        : "Your LCH contribution was received",
      message: isCompleted
        ? `Your contribution of ${formattedAmount} was recorded. ${data.plan.title} has reached its target amount.`
        : `Your contribution of ${formattedAmount} was recorded for ${data.plan.title}.`,
    })
  }

  return NextResponse.json(data)
}

type ContributionResponse = {
  plan: {
    title: string
    status: string
  }
}

function isContributionResponse(value: unknown): value is ContributionResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "plan" in value &&
    typeof (value as ContributionResponse).plan?.title === "string" &&
    typeof (value as ContributionResponse).plan?.status === "string"
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}
