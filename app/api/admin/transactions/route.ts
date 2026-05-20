import { requireAdmin } from "@/lib/auth-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const type = searchParams.get("type")
  const status = searchParams.get("status")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  let query = supabase
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

  if (userId && userId !== "all") query = query.eq("user_id", userId)
  if (type && type !== "all") query = query.eq("type", type)
  if (status && status !== "all") query = query.eq("status", status)
  if (from) query = query.gte("created_at", new Date(from).toISOString())
  if (to) {
    const endDate = new Date(to)
    endDate.setHours(23, 59, 59, 999)
    query = query.lte("created_at", endDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: "Unable to load transactions" },
      { status: 500 }
    )
  }

  return NextResponse.json({ transactions: data || [] })
}
