import { readRequestBody } from "@/lib/request-body"
import { requireActiveUser } from "@/lib/auth-server"
import { sendNotificationEmail } from "@/lib/notifications"
import { createAdminClient } from "@/lib/supabase/admin"
import { profileUpdateSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const context = await requireActiveUser()

  if (context.error) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  return NextResponse.json({
    profile: {
      ...context.profile,
      roles: context.profile?.roles?.length
        ? context.profile.roles
        : [context.profile?.active_role ?? context.profile?.role ?? "user"],
    },
  })
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
    .select("id, full_name, email, phone, role, active_role, roles, status, avatar_url, created_at, updated_at")
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

  return NextResponse.json({
    profile: {
      ...data,
      roles: data.roles?.length ? data.roles : [data.active_role ?? data.role],
    },
  })
}

export async function DELETE() {
  const context = await requireActiveUser()

  if (context.error || !context.user || !context.profile) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: "Admin service client is not configured" },
      { status: 500 }
    )
  }

  const { error } = await supabase.auth.admin.deleteUser(context.user.id)

  if (error) {
    return NextResponse.json(
      { error: "Unable to delete your account" },
      { status: 500 }
    )
  }

  if (context.profile.email) {
    await sendNotificationEmail({
      to: context.profile.email,
      subject: "Your LCH account was deleted",
      message:
        "Your Leenah Contribution Home account has been deleted successfully. We are sorry to see you go.",
    })
  }

  return NextResponse.json({ message: "Account deleted" })
}
