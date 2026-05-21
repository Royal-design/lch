import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ user: null, profile: null }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, active_role, status, avatar_url")
    .eq("id", user.id)
    .single()

  if (profileError) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role_name")
    .eq("user_id", user.id)

  return NextResponse.json({
    user,
    profile: {
      ...profile,
      roles:
        roles?.map((role) => role.role_name) ?? [
          profile.active_role ?? profile.role,
        ],
    },
  })
}
