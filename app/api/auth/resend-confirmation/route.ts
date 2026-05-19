import { buildAuthRedirectUrl } from "@/lib/auth-redirects"
import { readRequestBody } from "@/lib/request-body"
import { createClient } from "@/lib/supabase/server"
import { forgotPasswordSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await readRequestBody(request)
  const validationResult = forgotPasswordSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { email } = validationResult.data
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: buildAuthRedirectUrl(request, "/dashboard"),
    },
  })

  if (error) {
    console.error("Resend confirmation error:", error)
  }

  return NextResponse.json({
    message:
      "If the account is waiting for confirmation, a new confirmation email has been sent.",
  })
}
