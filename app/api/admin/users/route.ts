import { requireAdmin } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function GET() {
  const context = await requireAdmin()

  if (context.error) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const { data, error } = await context.supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      phone,
      role,
      active_role,
      status,
      created_at,
      wallets (balance, locked_balance),
      user_roles (role_name)
    `
    )
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "Unable to load users" },
      { status: 500 }
    )
  }

  return NextResponse.json({ users: data || [] })
}
