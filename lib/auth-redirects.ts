import type { NextRequest } from "next/server"

export function getRequestOrigin(request: NextRequest | Request) {
  const requestUrl = new URL(request.url)
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https"

  if (forwardedHost && process.env.NODE_ENV !== "development") {
    return `${forwardedProto}://${forwardedHost}`
  }

  return requestUrl.origin
}

export function sanitizeNextPath(nextPath: string | null, fallback = "/dashboard") {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback
  }

  return nextPath
}

export function buildAuthRedirectUrl(
  request: NextRequest | Request,
  nextPath = "/dashboard"
) {
  const url = new URL("/auth/callback", getRequestOrigin(request))
  url.searchParams.set("next", sanitizeNextPath(nextPath))

  return url.toString()
}
