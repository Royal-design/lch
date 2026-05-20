import { requireActiveUser } from "@/lib/auth-server"
import { readRequestBody } from "@/lib/request-body"
import { createAdminClient } from "@/lib/supabase/admin"
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
  const supabase = createAdminClient() ?? auth.supabase
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
  const { data: plan, error: planError } = await supabase
    .from("contribution_plans")
    .select("id, title, target_amount, saved_amount, lock_duration, status, created_at")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single()

  if (planError || !plan) {
    return NextResponse.json(
      { error: "Contribution plan not found" },
      { status: 404 }
    )
  }

  if (plan.status !== "active") {
    return NextResponse.json(
      { error: "You can only add funds to active plans" },
      { status: 400 }
    )
  }

  const savedAmount = Number(plan.saved_amount) || 0
  const targetAmount = Number(plan.target_amount) || 0
  const remainingAmount = targetAmount - savedAmount

  if (amount > remainingAmount) {
    return NextResponse.json(
      {
        error: `Amount exceeds remaining target of NGN ${remainingAmount.toLocaleString("en-NG")}`,
      },
      { status: 400 }
    )
  }

  const nextSavedAmount = savedAmount + amount
  const nextStatus =
    nextSavedAmount >= targetAmount ? "completed" : plan.status

  const { data, error } = await supabase
    .from("contribution_plans")
    .update({
      saved_amount: nextSavedAmount,
      status: nextStatus,
    })
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select("id, title, target_amount, saved_amount, lock_duration, status, created_at")
    .single()

  if (error) {
    return NextResponse.json(
      { error: "Unable to add funds to this plan" },
      { status: 500 }
    )
  }

  const reference = `LCH-CON-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`

  const { data: contribution, error: contributionError } = await supabase
    .from("transactions")
    .insert({
      user_id: auth.user.id,
      type: "contribution",
      amount,
      status: "successful",
      reference,
      description: `Contribution to ${plan.title}`,
    })
    .select("id, type, amount, status, reference, description, created_at")
    .single()

  if (contributionError) {
    return NextResponse.json(
      {
        error:
          "Plan updated, but the contribution history could not be recorded.",
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ plan: data, contribution })
}
