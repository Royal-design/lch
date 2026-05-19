import { requireActiveUser } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function GET() {
  const context = await requireActiveUser()

  if (context.error) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

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

  return NextResponse.json({ ajoTypes: data || [] })
}
