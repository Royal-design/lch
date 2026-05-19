import { updateSession } from "@/lib/supabase/proxy"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "./lib/supabase/server"

export async function proxy(request: NextRequest) {
  //  Update session FIRST (this must be returned)
  const updatedResponse = await updateSession(request)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/api/auth")) {
    return updatedResponse
  }

  const protectedRoutes = ["/dashboard", "/admin", "/profile", "/settings"]
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  const authRoutes = ["/login", "/register", "/signup", "/forgot-password"]
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Not logged in → block protected routes
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  let profile: { role: string; status: string } | null = null

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single()

    profile = data

    if (profile?.status === "suspended") {
      return NextResponse.redirect(
        new URL(
          "/api/auth/logout?next=/login?error=account-suspended",
          request.url
        )
      )
    }

    if (pathname.startsWith("/admin") && profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Logged in → block auth pages
  if (user && isAuthRoute) {
    return NextResponse.redirect(
      new URL(profile?.role === "admin" ? "/admin" : "/dashboard", request.url)
    )
  }

  // IMPORTANT: return the updated session response
  return updatedResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
