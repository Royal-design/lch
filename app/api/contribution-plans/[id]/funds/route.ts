import { requireActiveUser } from "@/lib/auth-server"
import { readRequestBody } from "@/lib/request-body"
import { addContributionSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireActiveUser()

  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await context.params
  const body = await readRequestBody(request)
  const validationResult = addContributionSchema.safeParse({
    ...body,
    planId: id,
  })

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { amount } = validationResult.data
  const { data, error } = await auth.supabase.rpc("record_plan_contribution", {
    p_plan_id: id,
    p_amount: amount,
  })

  if (error) {
    const message = error.message || "Unable to record this contribution"
    const status =
      message.includes("not found") ? 404 : message.includes("active") ? 400 : 500

    return NextResponse.json({ error: message }, { status })
  }

  return NextResponse.json(data)
}
