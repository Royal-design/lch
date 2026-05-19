import type { NextRequest } from "next/server"

export async function readRequestBody(request: NextRequest) {
  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return request.json()
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData()
    return Object.fromEntries(formData.entries())
  }

  return {}
}
