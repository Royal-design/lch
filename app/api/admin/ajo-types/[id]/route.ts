import { requireAdmin } from "@/lib/auth-server"
import { readRequestBody } from "@/lib/request-body"
import { ajoTypeUpdateSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin()

  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await readRequestBody(request)
  const validationResult = ajoTypeUpdateSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { id } = await context.params
  const { data, error } = await auth.supabase
    .from("ajo_types")
    .update({
      ...validationResult.data,
      description: validationResult.data.description || null,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ajoType: data })
}
