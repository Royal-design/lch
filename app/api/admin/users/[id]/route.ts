import { requireAdmin } from "@/lib/auth-server"
import {
  createSystemNotification,
  sendNotificationEmail,
} from "@/lib/notifications"
import { readRequestBody } from "@/lib/request-body"
import { createAdminClient } from "@/lib/supabase/admin"
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

  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: "Admin service client is not configured" },
      { status: 500 }
    )
  }

  const { id } = await context.params
  const body = await readRequestBody(request)
  const action = new URL(request.url).searchParams.get("action")

  if (action === "role") {
    const validationResult = userRoleUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const selectedRoles = validationResult.data.roles
    const { data: existingRoles, error: rolesError } = await supabase
      .from("roles")
      .select("name")
      .in("name", selectedRoles)

    if (rolesError || (existingRoles?.length ?? 0) !== selectedRoles.length) {
      return NextResponse.json(
        { error: "Choose existing roles" },
        { status: 400 }
      )
    }

    const { data: currentProfile, error: currentProfileError } = await supabase
      .from("profiles")
      .select("active_role")
      .eq("id", id)
      .single()

    if (currentProfileError) {
      return NextResponse.json(
        { error: "Unable to update user" },
        { status: 500 }
      )
    }

    const currentActiveRole =
      typeof currentProfile.active_role === "string"
        ? currentProfile.active_role
        : null
    const activeRole = currentActiveRole && selectedRoles.includes(currentActiveRole)
      ? currentActiveRole
      : selectedRoles[0]

    const { data, error } = await supabase
      .from("profiles")
      .update({
        role: activeRole,
        active_role: activeRole,
        roles: selectedRoles,
      })
      .eq("id", id)
      .select("id, full_name, email, phone, role, active_role, roles, status, created_at")
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Unable to update user" },
        { status: 500 }
      )
    }

    await createSystemNotification({
      userId: data.id,
      title: "Roles changed",
      message: `Your account roles were updated to ${selectedRoles.join(", ")}.`,
      email: {
        to: data.email,
        subject: "Your LCH account roles changed",
      },
    })

    return NextResponse.json({ user: data })
  }

  const validationResult = userStatusUpdateSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ status: validationResult.data.status })
    .eq("id", id)
    .select("id, full_name, email, phone, role, active_role, roles, status, created_at")
    .single()

  if (error) {
    return NextResponse.json(
      { error: "Unable to update user" },
      { status: 500 }
    )
  }

  const statusLabel = data.status === "suspended" ? "suspended" : "activated"

  await createSystemNotification({
    userId: data.id,
    title: data.status === "suspended" ? "Account suspended" : "Account activated",
    message:
      data.status === "suspended"
        ? "Your LCH account has been suspended. Contact support if you think this was a mistake."
        : "Your LCH account has been activated again.",
    email: {
      to: data.email,
      subject: `Your LCH account was ${statusLabel}`,
    },
  })

  return NextResponse.json({ user: data })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin()

  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: "Admin service client is not configured" },
      { status: 500 }
    )
  }

  const { id } = await context.params

  if (id === auth.user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own admin account" },
      { status: 400 }
    )
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) {
    return NextResponse.json(
      { error: "Unable to delete user" },
      { status: 500 }
    )
  }

  if (profile.email) {
    await sendNotificationEmail({
      to: profile.email,
      subject: "Your LCH account was deleted",
      message:
        "Your Leenah Contribution Home account has been deleted by an administrator. Contact support if you think this was a mistake.",
    })
  }

  return NextResponse.json({ message: "User deleted" })
}
