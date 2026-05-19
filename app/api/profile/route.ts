import { readRequestBody } from "@/lib/request-body"
import { requireActiveUser } from "@/lib/auth-server"
import { profileUpdateSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const context = await requireActiveUser()

  if (context.error) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  return NextResponse.json({ profile: context.profile })
}

export async function PATCH(request: NextRequest) {
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const body = await readRequestBody(request)
  const validationResult = profileUpdateSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { fullName, phone, avatarUrl } = validationResult.data
  const { data, error } = await context.supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      avatar_url: avatarUrl || null,
    })
    .eq("id", context.user.id)
    .select("id, full_name, email, phone, role, status, avatar_url, created_at, updated_at")
    .single()

  if (error) {
    return NextResponse.json(
      { error: "Unable to update profile" },
      { status: 500 }
    )
  }

  await context.supabase.auth.updateUser({
    data: {
      full_name: fullName,
      phone: phone || null,
      avatar_url: avatarUrl || null,
    },
  })

  return NextResponse.json({ profile: data })
}
