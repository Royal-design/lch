import { createClient } from "@/lib/supabase/server"
import { buildAuthRedirectUrl } from "@/lib/auth-redirects"
import { readRequestBody } from "@/lib/request-body"
import { registerSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await readRequestBody(req)

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { fullName, phone, email, password } = validationResult.data

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: buildAuthRedirectUrl(req, "/dashboard"),
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        message:
          "Account created successfully. Please check your email to confirm your account.",
        user: data.user,
        requiresEmailConfirmation: !data.session,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
