import { requireAdmin } from "@/lib/auth-server"
import { readRequestBody } from "@/lib/request-body"
import { userRoleUpdateSchema, userStatusUpdateSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin()

  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await context.params
  const body = await readRequestBody(request)
  const action = new URL(request.url).searchParams.get("action")
  const validationResult =
    action === "role"
      ? userRoleUpdateSchema.safeParse(body)
      : userStatusUpdateSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const update =
    action === "role"
      ? { role: userRoleUpdateSchema.parse(body).role }
      : { status: userStatusUpdateSchema.parse(body).status }

  const { data, error } = await auth.supabase
    .from("profiles")
    .update(update)
    .eq("id", id)
    .select("id, full_name, email, phone, role, status, created_at")
    .single()

  if (error) {
    return NextResponse.json(
      { error: "Unable to update user" },
      { status: 500 }
    )
  }

  return NextResponse.json({ user: data })
}
