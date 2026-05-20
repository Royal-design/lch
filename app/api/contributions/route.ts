import { requireActiveUser } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function GET() {
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const { data, error } = await context.supabase
    .from("transactions")
    .select("id, type, amount, status, reference, description, created_at")
    .eq("user_id", context.user.id)
    .eq("type", "contribution")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json(
      { error: "Unable to load contribution history" },
      { status: 500 }
    )
  }

  return NextResponse.json({ contributions: data || [] })
}
