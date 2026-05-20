import { requireActiveUser } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function GET() {
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const { data: joinedPlans, error: joinedError } = await context.supabase
    .from("contribution_plans")
    .select("ajo_type_id")
    .eq("user_id", context.user.id)
    .not("ajo_type_id", "is", null)

  if (joinedError) {
    return NextResponse.json(
      { error: "Unable to load joined Ajo plans" },
      { status: 500 }
    )
  }

  const joinedAjoTypeIds = new Set(
    (joinedPlans || [])
      .map((plan) => plan.ajo_type_id)
      .filter((id): id is string => Boolean(id))
  )

  const { data, error } = await context.supabase
    .from("ajo_types")
    .select(
      "id, plan_name, description, target_amount, min_contribution, frequency, withdrawal_access, lock_duration_months, member_limit"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "Unable to load joinable Ajo types" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ajoTypes: (data || []).filter((ajoType) => !joinedAjoTypeIds.has(ajoType.id)),
  })
}
