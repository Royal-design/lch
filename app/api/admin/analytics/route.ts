import { requireAdmin } from "@/lib/auth-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)
}

function monthLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}-01T00:00:00.000Z`))
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
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

  const [transactionsResult, profilesResult, plansResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, user_id, type, amount, status, created_at"),
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at, last_sign_in_at"),
    supabase
      .from("contribution_plans")
      .select(
        "id, user_id, title, saved_amount, status, created_at, ajo_types (plan_name, name)"
      ),
  ])

  if (transactionsResult.error || profilesResult.error || plansResult.error) {
    return NextResponse.json(
      { error: "Unable to load analytics" },
      { status: 500 }
    )
  }

  const transactions = transactionsResult.data || []
  const profiles = profilesResult.data || []
  const plans = plansResult.data || []
  const flowMap = new Map<
    string,
    {
      day: string
      deposits: number
      withdrawals: number
      users: number
      contributions: number
    }
  >()

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(since)
    date.setDate(since.getDate() + index)
    flowMap.set(dayKey(date), {
      day: dayLabel(date),
      deposits: 0,
      withdrawals: 0,
      users: 0,
      contributions: 0,
    })
  }

  for (const profile of profiles) {
    if (!profile.last_sign_in_at) continue

    const bucket = flowMap.get(dayKey(new Date(profile.last_sign_in_at)))
    if (bucket) bucket.users += 1
  }

  for (const transaction of transactions) {
    const bucket = flowMap.get(dayKey(new Date(transaction.created_at)))
    const amount = Number(transaction.amount) || 0

    if (bucket) {
      if (transaction.type === "deposit") bucket.deposits += amount
      if (transaction.type === "withdrawal") bucket.withdrawals += amount
      if (transaction.type === "contribution") bucket.contributions += amount
    }
  }

  const monthlyContributions = new Map<string, number>()
  const userContributionTotals = new Map<string, number>()
  const planTypeCounts = new Map<string, number>()

  for (const transaction of transactions) {
    if (transaction.type !== "contribution") continue

    const amount = Number(transaction.amount) || 0
    const month = new Date(transaction.created_at).toISOString().slice(0, 7)
    monthlyContributions.set(
      month,
      (monthlyContributions.get(month) || 0) + amount
    )
    userContributionTotals.set(
      transaction.user_id,
      (userContributionTotals.get(transaction.user_id) || 0) + amount
    )
  }

  for (const plan of plans) {
    const ajoType = Array.isArray(plan.ajo_types)
      ? plan.ajo_types[0]
      : plan.ajo_types
    const label = ajoType?.plan_name || ajoType?.name || "Personal plan"
    planTypeCounts.set(label, (planTypeCounts.get(label) || 0) + 1)
  }

  const topMonth = Array.from(monthlyContributions.entries()).sort(
    (left, right) => right[1] - left[1]
  )[0]
  const topUser = Array.from(userContributionTotals.entries()).sort(
    (left, right) => right[1] - left[1]
  )[0]
  const topProfile = topUser
    ? profiles.find((profile) => profile.id === topUser[0])
    : null
  const topPlanType = Array.from(planTypeCounts.entries()).sort(
    (left, right) => right[1] - left[1]
  )[0]

  return NextResponse.json({
    flowData: Array.from(flowMap.values()),
    insights: [
      {
        label: "Highest contributing month",
        value: topMonth ? monthLabel(topMonth[0]) : "No contributions yet",
        caption: topMonth ? `${formatCurrency(topMonth[1])} inflow` : "Waiting for contribution records",
      },
      {
        label: "Top performing user",
        value: topProfile?.full_name || topProfile?.email || "No contributor yet",
        caption: topUser ? `${formatCurrency(topUser[1])} total contributed` : "No contribution totals available",
      },
      {
        label: "Most active plan type",
        value: topPlanType?.[0] || "No plans yet",
        caption: topPlanType ? `${topPlanType[1].toLocaleString("en-NG")} plans` : "Create or join plans to see trends",
      },
    ],
  })
}
