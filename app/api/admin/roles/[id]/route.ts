import { requireAdmin } from "@/lib/auth-server"
import { readRequestBody } from "@/lib/request-body"
import { roleUpdateSchema } from "@/schemas/auth"
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
  const validationResult = roleUpdateSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { id } = await context.params
  const { data, error } = await auth.supabase
    .from("roles")
    .update(validationResult.data)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ role: data })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin()

  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await context.params
  const { data: role } = await auth.supabase
    .from("roles")
    .select("is_system")
    .eq("id", id)
    .single()

  if (role?.is_system) {
    return NextResponse.json(
      { error: "System roles cannot be deleted" },
      { status: 400 }
    )
  }

  const { error } = await auth.supabase.from("roles").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Role deleted" })
}
