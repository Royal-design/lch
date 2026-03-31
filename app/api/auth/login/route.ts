import { supabaseServer } from "@/lib/supabase-server"
import { loginSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request body
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Sign in with Supabase Auth
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseServer
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

    // Create response with session cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: profile,
    })

    // Set session cookies
    if (data.session) {
      response.cookies.set("sb-access-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: data.session.expires_in || 3600,
      })
      response.cookies.set("sb-refresh-token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 604800, // 7 days
      })
    }

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
