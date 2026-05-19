import { createClient } from "@/lib/supabase/server"
import { readRequestBody } from "@/lib/request-body"
import { loginSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await readRequestBody(req)

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
      .from("profiles")
      .select("id, full_name, email, phone, role, status, avatar_url")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      )
    }

    if (profile.status === "suspended") {
      await supabase.auth.signOut()

      return NextResponse.json(
        { error: "This account has been suspended. Contact support." },
        { status: 403 }
      )
    }

    await supabase
      .from("profiles")
      .update({ last_sign_in_at: new Date().toISOString() })
      .eq("id", data.user.id)

    const response = NextResponse.json({
      message: "Login successful",
      user: profile,
      redirectTo: profile.role === "admin" ? "/admin" : "/dashboard",
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
