import { requireAdmin } from "@/lib/auth-server"
import { sendNotificationEmail } from "@/lib/notifications"
import { readRequestBody } from "@/lib/request-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const broadcastSchema = z.object({
  title: z.string().trim().min(3).max(80),
  message: z.string().trim().min(3).max(500),
  email: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()

  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: "Admin service client is not configured" },
      { status: 500 }
    )
  }

  const body = await readRequestBody(request)
  const validationResult = broadcastSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    )
  }

  const { title, message, email } = validationResult.data
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("status", "active")

  if (usersError) {
    return NextResponse.json(
      { error: "Unable to load notification recipients" },
      { status: 500 }
    )
  }

  const recipients = users || []

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No active users to notify" },
      { status: 400 }
    )
  }

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert(
      recipients.map((user) => ({
        user_id: user.id,
        title,
        message,
      }))
    )

  if (notificationError) {
    return NextResponse.json(
      { error: "Unable to create broadcast notifications" },
      { status: 500 }
    )
  }

  const emailRecipients = email
    ? recipients.filter((user) => Boolean(user.email))
    : []

  await Promise.allSettled(
    emailRecipients.map((user) =>
      sendNotificationEmail({
        to: user.email!,
        subject: title,
        message,
      })
    )
  )

  return NextResponse.json({
    ok: true,
    notified: recipients.length,
    emailed: emailRecipients.length,
  })
}
