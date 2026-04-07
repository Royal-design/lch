import { createClient } from "@/lib/supabase/server"
import { registerSchema2 } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await req.json()

    // Validate input
    const validationResult = registerSchema2.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, gender, location, email, password } = validationResult.data

    // ONLY SIGNUP (no manual insert)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, gender, location },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        message:
          "Account created successfully. Please check your email to confirm.",
        user: data.user,
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
