import { requireActiveUser } from "@/lib/auth-server"
import { readRequestBody } from "@/lib/request-body"
import { contributionPlanSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const { data, error } = await context.supabase
    .from("contribution_plans")
    .select("id, title, target_amount, saved_amount, lock_duration, status, created_at")
    .eq("user_id", context.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "Unable to load contribution plans" },
      { status: 500 }
    )
  }

  return NextResponse.json({ plans: data || [] })
}

export async function POST(request: NextRequest) {
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const body = await readRequestBody(request)
  const validationResult = contributionPlanSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const values = validationResult.data
  const { data, error } = await context.supabase
    .from("contribution_plans")
    .insert({
      user_id: context.user.id,
      title: values.planName,
      target_amount: values.targetAmount,
      lock_duration: `${values.lockDuration} months`,
      status: "active",
    })
    .select("id, title, target_amount, saved_amount, lock_duration, status, created_at")
    .single()

  if (error) {
    return NextResponse.json(
      { error: "Unable to create contribution plan" },
      { status: 500 }
    )
  }

  return NextResponse.json({ plan: data }, { status: 201 })
}
