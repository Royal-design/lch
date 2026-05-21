import { requireActiveUser } from "@/lib/auth-server"
import { createSystemNotification } from "@/lib/notifications"
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
    .select("id, plan_name, target_amount, lock_duration_months, member_limit, status")
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
    .eq("ajo_type_id", ajoType.id)
    .maybeSingle()

  if (existingPlan) {
    return NextResponse.json(
      { error: "You have already joined this Ajo" },
      { status: 409 }
    )
  }

  const { count, error: countError } = await auth.supabase
    .from("contribution_plans")
    .select("id", { count: "exact", head: true })
    .eq("ajo_type_id", ajoType.id)
    .in("status", ["active", "paused"])

  if (countError) {
    return NextResponse.json(
      { error: "Unable to confirm Ajo availability" },
      { status: 500 }
    )
  }

  if ((count || 0) >= ajoType.member_limit) {
    return NextResponse.json(
      { error: "This Ajo has reached its member limit" },
      { status: 409 }
    )
  }

  const { data, error } = await auth.supabase
    .from("contribution_plans")
    .insert({
      user_id: auth.user.id,
      ajo_type_id: ajoType.id,
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

  await createSystemNotification({
    userId: auth.user.id,
    title: "Joined Ajo",
    message: `You joined ${ajoType.plan_name}. Contributions can now be recorded for this plan.`,
  })

  return NextResponse.json({ plan: data }, { status: 201 })
}
