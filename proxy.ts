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

  const protectedRoutes = ["/dashboard", "/profile", "/settings"]
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  const authRoutes = ["/login", "/register"]
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Not logged in → block protected routes
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Logged in → block auth pages
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // IMPORTANT: return the updated session response
  return updatedResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
