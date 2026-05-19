import { requireAdmin } from "@/lib/auth-server"
import { readRequestBody } from "@/lib/request-body"
import { roleCreateSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const context = await requireAdmin()

  if (context.error) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const { data, error } = await context.supabase
    .from("roles")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: "Unable to load roles" },
      { status: 500 }
    )
  }

  return NextResponse.json({ roles: data || [] })
}

export async function POST(request: NextRequest) {
  const context = await requireAdmin()

  if (context.error) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const body = await readRequestBody(request)
  const validationResult = roleCreateSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { data, error } = await context.supabase
    .from("roles")
    .insert(validationResult.data)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ role: data }, { status: 201 })
}
