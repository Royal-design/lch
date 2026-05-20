import { requireAdmin } from "@/lib/auth-server"
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

  return NextResponse.json({ plan: data })
}
