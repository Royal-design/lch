import { requireActiveUser } from "@/lib/auth-server"
import { NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const auth = await requireActiveUser()

  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await context.params
  const { data: ajoType, error: ajoError } = await auth.supabase
    .from("ajo_types")
    .select("id, plan_name, target_amount, lock_duration_months, status")
    .eq("id", id)
    .eq("status", "active")
    .single()

  if (ajoError || !ajoType) {
    return NextResponse.json(
      { error: "This Ajo type is not available" },
      { status: 404 }
    )
  }

  const { data: existingPlan } = await auth.supabase
    .from("contribution_plans")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("title", ajoType.plan_name)
    .maybeSingle()

  if (existingPlan) {
    return NextResponse.json(
      { error: "You have already joined this Ajo" },
      { status: 409 }
    )
  }

  const { data, error } = await auth.supabase
    .from("contribution_plans")
    .insert({
      user_id: auth.user.id,
      title: ajoType.plan_name,
      target_amount: ajoType.target_amount,
      lock_duration: `${ajoType.lock_duration_months} months`,
      status: "active",
    })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json(
      { error: "Unable to join this Ajo" },
      { status: 500 }
    )
  }

  return NextResponse.json({ plan: data }, { status: 201 })
}
