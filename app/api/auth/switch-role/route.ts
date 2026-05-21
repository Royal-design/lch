import { requireActiveUser } from "@/lib/auth-server"
import { readRequestBody } from "@/lib/request-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const switchRoleSchema = z.object({
  role: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z][a-z0-9_]*$/),
})

export async function POST(request: NextRequest) {
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const body = await readRequestBody(request)
  const validationResult = switchRoleSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json({ error: "Choose a valid role" }, { status: 400 })
  }

  const { role } = validationResult.data
  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: "Admin service client is not configured" },
      { status: 500 }
    )
  }

  const assignedRoles = context.profile?.roles?.length
    ? context.profile.roles
    : [context.profile?.active_role ?? context.profile?.role ?? "user"]

  if (!assignedRoles.includes(role)) {
    return NextResponse.json(
      { error: "This role is not assigned to your account" },
      { status: 403 }
    )
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ active_role: role, role })
    .eq("id", context.user.id)
    .select("id, full_name, email, phone, role, active_role, roles, status, avatar_url, created_at, updated_at")
    .single()

  if (error) {
    return NextResponse.json(
      { error: "Unable to switch role" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    profile: {
      ...profile,
      roles: profile.roles?.length ? profile.roles : [role],
    },
    redirectTo: role === "admin" ? "/admin" : "/dashboard",
  })
}
