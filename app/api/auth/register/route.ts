import { supabaseServer } from "@/lib/supabase-server"
import { registerSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request body
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, gender, location, email, password } = validationResult.data

    // Check if user already exists
    const { data: existingUser, error: existingError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email (disable for production if you want email verification)
        user_metadata: {
          name,
          gender,
          location,
        },
      })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Create user profile in database
    const { data: profileData, error: profileError } = await supabaseServer
      .from("users")
      .insert({
        id: authData.user.id,
        name,
        gender,
        location,
        email,
      })
      .select()
      .single()

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabaseServer.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          gender: profileData.gender,
          location: profileData.location,
        },
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
