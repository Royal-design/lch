import { createClient } from "@/lib/supabase/server"
import { readRequestBody } from "@/lib/request-body"
import { resetPasswordSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Your reset link has expired. Request a new password reset." },
      { status: 401 }
    )
  }

  const body = await readRequestBody(request)
  const validationResult = resetPasswordSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { error } = await supabase.auth.updateUser({
    password: validationResult.data.password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Password updated successfully" })
}
