import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      let roleRedirect = next

      if (user && next === "/dashboard") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        roleRedirect = profile?.role === "admin" ? "/admin" : "/dashboard"
      }

      const forwardedHost = request.headers.get("x-forwarded-host") // developed or deployed
      const isLocalEnv = process.env.NODE_ENV === "development"
      if (isLocalEnv) {
        // we can be sure that origin is http://localhost:3000
        return NextResponse.redirect(`${origin}${roleRedirect}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${roleRedirect}`)
      } else {
        return NextResponse.redirect(`${origin}${roleRedirect}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-code-exchange-failed`)
}
