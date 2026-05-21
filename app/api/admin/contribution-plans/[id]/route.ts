import { requireAdmin } from "@/lib/auth-server"
import { createSystemNotification } from "@/lib/notifications"
import { readRequestBody } from "@/lib/request-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

const adminPlanUpdateSchema = z.object({
  status: z.enum(["active", "paused", "cancelled", "completed"]),
})

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
  const validationResult = adminPlanUpdateSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { data: existingPlan, error: existingPlanError } = await supabase
    .from("contribution_plans")
    .select("id, user_id, title, status")
    .eq("id", id)
    .single()

  if (existingPlanError || !existingPlan) {
    return NextResponse.json(
      { error: "Contribution plan not found" },
      { status: 404 }
    )
  }

  const { data, error } = await supabase
    .from("contribution_plans")
    .update({ status: validationResult.data.status })
    .eq("id", id)
    .select(
      `
      id,
      user_id,
      ajo_type_id,
      title,
      target_amount,
      saved_amount,
      lock_duration,
      status,
      created_at,
      updated_at,
      profiles (full_name, email),
      ajo_types (plan_name, name, status)
    `
    )
    .single()

  if (error) {
    return NextResponse.json(
      { error: "Unable to update contribution plan" },
      { status: 500 }
    )
  }

  if (existingPlan.status !== data.status) {
    const notification = getPlanStatusNotification({
      title: data.title,
      previousStatus: existingPlan.status,
      nextStatus: data.status,
    })
    const email = getProfileEmail(data.profiles)

    await createSystemNotification({
      userId: data.user_id,
      title: notification.title,
      message: notification.message,
      email: email
        ? {
            to: email,
            subject: notification.subject,
          }
        : undefined,
    })
  }

  return NextResponse.json({ plan: data })
}

type ProfileRelation =
  | {
      email?: string | null
    }
  | {
      email?: string | null
    }[]
  | null

function getProfileEmail(profile: ProfileRelation) {
  if (Array.isArray(profile)) return profile[0]?.email || null
  return profile?.email || null
}

function getPlanStatusNotification({
  title,
  previousStatus,
  nextStatus,
}: {
  title: string
  previousStatus: string
  nextStatus: string
}) {
  if (nextStatus === "paused") {
    return {
      title: "Contribution plan locked",
      subject: "Your LCH contribution plan was locked",
      message: `${title} has been locked by an administrator. Contributions are paused until it is unlocked.`,
    }
  }

  if (nextStatus === "cancelled") {
    return {
      title: "Contribution plan disabled",
      subject: "Your LCH contribution plan was disabled",
      message: `${title} has been disabled by an administrator. Contact support if you need help with this plan.`,
    }
  }

  if (nextStatus === "active" && previousStatus === "paused") {
    return {
      title: "Contribution plan unlocked",
      subject: "Your LCH contribution plan was unlocked",
      message: `${title} has been unlocked. You can continue contributing to this plan.`,
    }
  }

  if (nextStatus === "active") {
    return {
      title: "Contribution plan enabled",
      subject: "Your LCH contribution plan was enabled",
      message: `${title} has been enabled again. You can continue using this plan.`,
    }
  }

  return {
    title: "Contribution plan updated",
    subject: "Your LCH contribution plan was updated",
    message: `${title} was updated by an administrator.`,
  }
}
