import { requireActiveUser } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function GET() {
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const [walletResult, plansResult, transactionsResult] = await Promise.all([
    context.supabase
      .from("wallets")
      .select("balance, locked_balance")
      .eq("user_id", context.user.id)
      .maybeSingle(),
    context.supabase
      .from("contribution_plans")
      .select("id, title, target_amount, saved_amount, lock_duration, status, created_at")
      .eq("user_id", context.user.id)
      .order("created_at", { ascending: false }),
    context.supabase
      .from("transactions")
      .select("id, type, amount, status, reference, description, created_at")
      .eq("user_id", context.user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  if (walletResult.error || plansResult.error || transactionsResult.error) {
    console.error("Dashboard query failed", {
      wallet: walletResult.error,
      plans: plansResult.error,
      transactions: transactionsResult.error,
    })

    return NextResponse.json(
      { error: "Unable to load dashboard data" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    wallet: walletResult.data ?? { balance: 0, locked_balance: 0 },
    plans: plansResult.data ?? [],
    transactions: transactionsResult.data ?? [],
  })
}
