import { requireAdmin } from "@/lib/auth-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
  const context = await requireAdmin()

  if (context.error) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: "Admin service client is not configured" },
      { status: 500 }
    )
  }

  const { data, error } = await supabase
    .from("contribution_plans")
    .select(
      `
      id,
      user_id,
      ajo_type_id,
      title,
      target_amount,
      saved_amount,
      lock_duration,
      status,
      created_at,
      updated_at,
      profiles (full_name, email),
      ajo_types (plan_name, name, status)
    `
    )
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "Unable to load contribution plans" },
      { status: 500 }
    )
  }

  return NextResponse.json({ plans: data || [] })
}
