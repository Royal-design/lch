import { requireActiveUser } from "@/lib/auth-server"
import { readRequestBody } from "@/lib/request-body"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50

const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  read: z.boolean().default(true),
})

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

  const pagination = getPagination(request)
  const { data, error, count } = await context.supabase
    .from("notifications")
    .select("id, title, message, read, created_at", { count: "exact" })
    .eq("user_id", context.user.id)
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to)

  if (error) {
    return NextResponse.json(
      { error: "Unable to load notifications" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    notifications: data || [],
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: count || 0,
      totalPages: Math.max(Math.ceil((count || 0) / pagination.pageSize), 1),
    },
  })
}

export async function PATCH(request: NextRequest) {
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const body = await readRequestBody(request)
  const validationResult = markReadSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { ids, read } = validationResult.data
  let query = context.supabase
    .from("notifications")
    .update({ read })
    .eq("user_id", context.user.id)

  if (ids?.length) {
    query = query.in("id", ids)
  }

  const { error } = await query

  if (error) {
    return NextResponse.json(
      { error: "Unable to update notifications" },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
