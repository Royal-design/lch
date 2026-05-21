import { requireAdmin } from "@/lib/auth-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

const DEFAULT_PAGE_SIZE = 25
const MAX_PAGE_SIZE = 100

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
  const pagination = getPagination(request)

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
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to)

  if (userId && userId !== "all") query = query.eq("user_id", userId)
  if (type && type !== "all") query = query.eq("type", type)
  if (status && status !== "all") query = query.eq("status", status)
  if (from) query = query.gte("created_at", new Date(from).toISOString())
  if (to) {
    const endDate = new Date(to)
    endDate.setHours(23, 59, 59, 999)
    query = query.lte("created_at", endDate.toISOString())
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Admin transactions query failed", error)

    return NextResponse.json(
      { error: "Unable to load transactions" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    transactions: data || [],
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: count || 0,
      totalPages: Math.max(Math.ceil((count || 0) / pagination.pageSize), 1),
    },
  })
}
