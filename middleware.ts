import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/profile", "/settings"]

// Routes that should redirect to dashboard if already logged in
const authRoutes = ["/login", "/register"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get("sb-access-token")

  // Check if accessing protected routes without auth
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if accessing auth routes (login/register)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth route with token, redirect to dashboard
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
