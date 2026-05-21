import { getRequestOrigin, sanitizeNextPath } from "@/lib/auth-redirects"
import { createSystemNotification } from "@/lib/notifications"
import { createClient } from "@/lib/supabase/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const origin = getRequestOrigin(request)
  const next = sanitizeNextPath(searchParams.get("next"), "/dashboard")
  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (type === "signup") {
        await notifySignupConfirmed(supabase)
      }

      return NextResponse.redirect(
        `${origin}${await resolveRedirect(supabase, next)}`
      )
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })

    if (!error) {
      return NextResponse.redirect(
        `${origin}${await resolveRedirect(supabase, next)}`
      )
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-code-exchange-failed`)
}

async function notifySignupConfirmed(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await createSystemNotification({
    userId: user.id,
    title: "Signup confirmed",
    message: "Your LCH signup has been confirmed. Welcome in.",
  })
}

async function resolveRedirect(
  supabase: Awaited<ReturnType<typeof createClient>>,
  next: string
) {
  if (next !== "/dashboard") {
    return next
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return "/login"
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active_role, status")
    .eq("id", user.id)
    .single()

  if (profile?.status === "suspended") {
    await supabase.auth.signOut()
    return "/login?error=account-suspended"
  }

  return (profile?.active_role ?? profile?.role) === "admin"
    ? "/admin"
    : "/dashboard"
}
