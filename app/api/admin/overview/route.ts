import { requireAdmin } from "@/lib/auth-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)
}

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

  const since = new Date()
  since.setDate(since.getDate() - 6)
  since.setHours(0, 0, 0, 0)

  const [
    usersResult,
    plansResult,
    activePlansResult,
    transactionsResult,
    notificationsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("contribution_plans")
      .select("id, saved_amount, status, created_at"),
    supabase
      .from("contribution_plans")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("transactions")
      .select("id, type, amount, status, created_at")
      .gte("created_at", since.toISOString()),
    supabase
      .from("notifications")
      .select("title, message, read, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  if (
    usersResult.error ||
    plansResult.error ||
    activePlansResult.error ||
    transactionsResult.error ||
    notificationsResult.error
  ) {
    console.error("Admin overview query failed", {
      users: usersResult.error,
      plans: plansResult.error,
      activePlans: activePlansResult.error,
      transactions: transactionsResult.error,
      notifications: notificationsResult.error,
    })

    return NextResponse.json(
      { error: "Unable to load admin overview" },
      { status: 500 }
    )
  }

  const plans = plansResult.data || []
  const transactions = transactionsResult.data || []
  const totalContributed = plans.reduce(
    (sum, plan) => sum + (Number(plan.saved_amount) || 0),
    0
  )
  const lockedFunds = plans
    .filter((plan) => ["active", "paused"].includes(plan.status))
    .reduce((sum, plan) => sum + (Number(plan.saved_amount) || 0), 0)
  const contributionTransactions = transactions.filter(
    (transaction) => transaction.type === "contribution"
  )

  const flowMap = new Map<
    string,
    { day: string; deposits: number; withdrawals: number; users: number; contributions: number }
  >()

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(since)
    date.setDate(since.getDate() + index)
    flowMap.set(dayKey(date), {
      day: dayLabel(date),
      deposits: 0,
      withdrawals: 0,
      users: usersResult.count || 0,
      contributions: 0,
    })
  }

  for (const transaction of transactions) {
    const bucket = flowMap.get(dayKey(new Date(transaction.created_at)))
    if (!bucket) continue

    const amount = Number(transaction.amount) || 0
    if (transaction.type === "deposit") bucket.deposits += amount
    if (transaction.type === "withdrawal") bucket.withdrawals += amount
    if (transaction.type === "contribution") bucket.contributions += amount
  }

  const kpis = {
    totalUsers: usersResult.count || 0,
    totalContributed,
    totalWithdrawals: transactions
      .filter((transaction) => transaction.type === "withdrawal")
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0),
    activePlans: activePlansResult.count || 0,
    lockedFunds,
    contributionRecords: contributionTransactions.length,
  }

  const notifications = (notificationsResult.data || []).map((notification) => [
    notification.read ? "Delivered" : "Unread",
    notification.title,
    notification.message,
    new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(
      new Date(notification.created_at)
    ),
  ])

  return NextResponse.json({
    kpis,
    flowData: Array.from(flowMap.values()),
    alerts: [],
    users: [],
    transactions: [],
    withdrawals: [],
    plans: [],
    leaderboard: [],
    notifications,
  })
}
