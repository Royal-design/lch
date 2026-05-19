import { requireAdmin } from "@/lib/auth-server"
import { readRequestBody } from "@/lib/request-body"
import { ajoTypeSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const context = await requireAdmin()

  if (context.error) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const { data, error } = await context.supabase
    .from("ajo_types")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "Unable to load Ajo types" },
      { status: 500 }
    )
  }

  return NextResponse.json({ ajoTypes: data || [] })
}

export async function POST(request: NextRequest) {
  const context = await requireAdmin()

  if (context.error) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const body = await readRequestBody(request)
  const validationResult = ajoTypeSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { data, error } = await context.supabase
    .from("ajo_types")
    .insert({
      ...validationResult.data,
      description: validationResult.data.description || null,
    })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ajoType: data }, { status: 201 })
}
