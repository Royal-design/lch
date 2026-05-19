import { buildAuthRedirectUrl } from "@/lib/auth-redirects"
import { readRequestBody } from "@/lib/request-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { forgotPasswordSchema } from "@/schemas/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await readRequestBody(request)
  const validationResult = forgotPasswordSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { email } = validationResult.data
  const accountLookup = await checkAccountExists(email)

  if (accountLookup.error) {
    return NextResponse.json(
      { error: accountLookup.error },
      { status: 500 }
    )
  }

  if (!accountLookup.exists) {
    return NextResponse.json(
      { error: "No LCH account is registered with that email address." },
      { status: 404 }
    )
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: buildAuthRedirectUrl(request, "/reset-password"),
  })

  if (error) {
    console.error("Forgot password error:", error)

    return NextResponse.json(
      { error: "We could not send the reset email. Please try again." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    message: "Password reset instructions have been sent to your email.",
  })
}

async function checkAccountExists(email: string) {
  const adminSupabase = createAdminClient()

  if (adminSupabase) {
    const { data, error } = await adminSupabase
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle()

    if (error) {
      console.error("Admin account lookup error:", error)
      return {
        exists: false,
        error: "We could not verify this email address. Please try again.",
      }
    }

    return { exists: Boolean(data), error: null }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("account_exists_for_email", {
    email_address: email,
  })

  if (error) {
    console.error("Account lookup RPC error:", error)
    return {
      exists: false,
      error:
        "Password reset is not fully configured. Please run database-auth-miles-1-2.sql in Supabase, then try again.",
    }
  }

  return { exists: Boolean(data), error: null }
}
