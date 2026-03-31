import { createClient } from "@/lib/supabase/server-route"
import { registerSchema2 } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    // Create response FIRST (required for cookie handling)
    const res = NextResponse.next()

    // Create Supabase client (API route version)
    const supabase = createClient(req, res)

    const body = await req.json()

    // Validate request body
    const validationResult = registerSchema2.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, gender, location, email, password } = validationResult.data

    //Check if user exists (not required, but allowed)
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          gender,
          location,
        },
      })

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create user" },
        { status: 500 }
      )
    }

    // Create user profile in your table
    const { data: profileData, error: profileError } = await supabase
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
      // Rollback: delete auth user if profile fails
      await supabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      )
    }

    // Success response
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
