import { requireActiveUser } from "@/lib/auth-server"
import { NextRequest, NextResponse } from "next/server"

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

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
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const { page, pageSize, from, to } = getPagination(request)
  const { data, error, count } = await context.supabase
    .from("transactions")
    .select("id, type, amount, status, reference, description, created_at", {
      count: "exact",
    })
    .eq("user_id", context.user.id)
    .eq("type", "contribution")
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json(
      { error: "Unable to load contribution history" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    contributions: data || [],
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.max(Math.ceil((count || 0) / pageSize), 1),
    },
  })
}
