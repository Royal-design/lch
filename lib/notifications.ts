import { sendSystemEmail } from "@/lib/email"
import { createAdminClient } from "@/lib/supabase/admin"

type NotificationPayload = {
  userId: string
  title: string
  message: string
  email?: {
    to: string
    subject?: string
  }
}

export async function createSystemNotification(payload: NotificationPayload) {
  const supabase = createAdminClient()

  if (!supabase) {
    console.warn("Notification skipped: Supabase admin client is not configured")
    return
  }

  const { error } = await supabase.from("notifications").insert({
    user_id: payload.userId,
    title: payload.title,
    message: payload.message,
  })

  if (error) {
    console.error("Unable to create notification", error)
  }

  if (payload.email?.to) {
    await sendNotificationEmail({
      to: payload.email.to,
      subject: payload.email.subject || payload.title,
      message: payload.message,
    })
  }
}

export async function sendNotificationEmail({
  to,
  subject,
  message,
}: {
  to: string
  subject: string
  message: string
}) {
  try {
    await sendSystemEmail({
      to,
      subject,
      text: message,
      html: `<p>${escapeHtml(message)}</p>`,
    })
  } catch (error) {
    console.error("Unable to send notification email", error)
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
