import { createClient } from "@/lib/supabase/server"
import { loginSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await req.json()

    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, name, email, gender, location")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      message: "Login successful",
      user: profile,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
