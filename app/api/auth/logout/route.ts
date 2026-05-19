import { createClient } from "@/lib/supabase/server"
import { sanitizeNextPath } from "@/lib/auth-redirects"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const next = sanitizeNextPath(
    request.nextUrl.searchParams.get("next"),
    "/login"
  )

  return NextResponse.redirect(new URL(next, request.url))
}

export async function POST() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Logged out" })
}
