import { updateSession } from "@/lib/supabase/proxy"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/profile", "/settings"]

// Routes that should redirect to dashboard if already logged in
const authRoutes = ["/login", "/register"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  //Run Supabase session update FIRST
  const response = await updateSession(req)

  // Now safely get user via Supabase cookie session
  // (We check manually via cookie presence — lightweight guard)
  const hasAuthCookie = req.cookies.get("sb-access-token")

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  //No auth → block protected routes
  if (isProtectedRoute && !hasAuthCookie) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Logged in → block login/register
  if (isAuthRoute && hasAuthCookie) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
