import { requireAdmin } from "@/lib/auth-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

const DEFAULT_PAGE_SIZE = 25
const MAX_PAGE_SIZE = 100

type ContributionRow = {
  id: string
  user_id: string
  amount: number | string
  status: string
  reference: string
  description: string | null
  created_at: string
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

function getPagination(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(Number(searchParams.get("page")) || 1, 1)
  const pageSize = Math.min(
    Math.max(Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  )
  const from = (page - 1) * pageSize

  return { page, pageSize, from, to: from + pageSize - 1 }
}

function getProfile(row: ContributionRow) {
  if (Array.isArray(row.profiles)) return row.profiles[0] ?? null
  return row.profiles
}

function bucketKey(date: Date, period: string) {
  if (period === "day") return date.toISOString().slice(0, 10)
  if (period === "week") {
    const firstDay = new Date(date)
    firstDay.setDate(date.getDate() - date.getDay())
    return firstDay.toISOString().slice(0, 10)
  }
  if (period === "year") return String(date.getFullYear())
  return date.toISOString().slice(0, 7)
}

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
  const status = searchParams.get("status")
  const period = searchParams.get("period") || "month"
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const pagination = getPagination(request)

  let query = supabase
    .from("transactions")
    .select(
      `
      id,
      user_id,
      amount,
      status,
      reference,
      description,
      created_at,
      profiles (full_name, email)
    `,
      { count: "exact" }
    )
    .eq("type", "contribution")
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to)

  if (userId && userId !== "all") query = query.eq("user_id", userId)
  if (status && status !== "all") query = query.eq("status", status)
  if (from) query = query.gte("created_at", new Date(from).toISOString())
  if (to) {
    const endDate = new Date(to)
    endDate.setHours(23, 59, 59, 999)
    query = query.lte("created_at", endDate.toISOString())
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Admin contributions query failed", error)

    return NextResponse.json(
      { error: "Unable to load contribution records" },
      { status: 500 }
    )
  }

  const rows = (data || []) as unknown as ContributionRow[]
  const bucketMap = new Map<string, { label: string; amount: number; count: number }>()
  const userMap = new Map<
    string,
    { user_id: string; name: string; email: string; amount: number; count: number }
  >()
  const activeDays = new Set<string>()

  for (const row of rows) {
    const amount = Number(row.amount) || 0
    const date = new Date(row.created_at)
    const key = bucketKey(date, period)
    const profile = getProfile(row)
    const name = profile?.full_name || profile?.email || "Unknown user"
    const email = profile?.email || ""

    activeDays.add(date.toISOString().slice(0, 10))

    const bucket = bucketMap.get(key)
    if (bucket) {
      bucket.amount += amount
      bucket.count += 1
    } else {
      bucketMap.set(key, { label: key, amount, count: 1 })
    }

    const user = userMap.get(row.user_id)
    if (user) {
      user.amount += amount
      user.count += 1
    } else {
      userMap.set(row.user_id, {
        user_id: row.user_id,
        name,
        email,
        amount,
        count: 1,
      })
    }
  }

  const totalAmount = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)

  return NextResponse.json({
    summary: {
      totalAmount,
      contributionCount: rows.length,
      averageAmount: rows.length ? totalAmount / rows.length : 0,
      activeDays: activeDays.size,
    },
    byPeriod: Array.from(bucketMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    ),
    byUser: Array.from(userMap.values()).sort((a, b) => b.amount - a.amount),
    contributions: rows.map((row) => {
      const profile = getProfile(row)
      return {
        id: row.id,
        user_id: row.user_id,
        user: profile?.full_name || profile?.email || "Unknown user",
        email: profile?.email || "",
        amount: Number(row.amount) || 0,
        status: row.status,
        reference: row.reference,
        description: row.description,
        created_at: row.created_at,
      }
    }),
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: count || 0,
      totalPages: Math.max(Math.ceil((count || 0) / pagination.pageSize), 1),
    },
  })
}
