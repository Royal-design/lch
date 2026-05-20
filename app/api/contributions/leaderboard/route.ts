import { requireActiveUser } from "@/lib/auth-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

type PlanRow = {
  user_id: string
  saved_amount: number | string
  status: string
  profiles:
    | {
        full_name: string
        email: string
      }
    | {
        full_name: string
        email: string
      }[]
    | null
}

function getProfile(row: PlanRow) {
  if (Array.isArray(row.profiles)) return row.profiles[0] ?? null
  return row.profiles
}

type ProfileRow = {
  full_name: string
  email: string
}

export async function GET() {
  const context = await requireActiveUser()

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
    .select("user_id, saved_amount, status, profiles (full_name, email)")
    .in("status", ["active", "paused", "completed"])

  if (error) {
    console.error("Contribution leaderboard query failed", error)

    return NextResponse.json(
      { error: "Unable to load leaderboard" },
      { status: 500 }
    )
  }

  const totals = new Map<
    string,
    { user_id: string; name: string; email: string; total: number; plans: number }
  >()

  for (const row of (data || []) as unknown as PlanRow[]) {
    const current = totals.get(row.user_id)
    const nextTotal = Number(row.saved_amount) || 0
    const profile: ProfileRow | null = getProfile(row)
    const name = profile?.full_name || profile?.email || "LCH Member"
    const email = profile?.email || ""

    if (current) {
      current.total += nextTotal
      current.plans += 1
    } else {
      totals.set(row.user_id, {
        user_id: row.user_id,
        name,
        email,
        total: nextTotal,
        plans: 1,
      })
    }
  }

  const leaderboard = Array.from(totals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      score: Math.min(100, Math.round(entry.total / 10000) + entry.plans * 5),
    }))

  return NextResponse.json({ leaderboard })
}
