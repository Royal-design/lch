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
    .from("transactions")
    .select(
      `
      id,
      user_id,
      type,
      amount,
      status,
      reference,
      description,
      created_at,
      profiles (full_name, email)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json(
      { error: "Unable to load transactions" },
      { status: 500 }
    )
  }

  return NextResponse.json({ transactions: data || [] })
}
