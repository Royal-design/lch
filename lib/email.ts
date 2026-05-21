type EmailPayload = {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendSystemEmail(payload: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) {
    console.warn("Email skipped: RESEND_API_KEY or EMAIL_FROM is not configured")
    return { skipped: true }
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(detail || "Unable to send email notification")
  }

  return { skipped: false }
}
