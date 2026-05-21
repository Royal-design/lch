const PAYSTACK_BASE_URL = "https://api.paystack.co"

type PaystackResponse<T> = {
  status: boolean
  message: string
  data: T
}

type InitializeTransactionPayload = {
  email: string
  amount: number
  reference: string
  callback_url: string
  channels?: string[]
  metadata?: Record<string, unknown>
}

export type PaystackInitializeData = {
  authorization_url: string
  access_code: string
  reference: string
}

export type PaystackVerifyData = {
  id: number
  status: string
  reference: string
  amount: number
  currency: string
  channel: string | null
  gateway_response: string | null
  paid_at: string | null
  metadata: Record<string, unknown> | null
}

export type PaystackWebhookEvent = {
  event: string
  data: PaystackVerifyData
}

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY

  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured")
  }

  return key
}

async function paystackRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })
  const data = (await response.json()) as PaystackResponse<T>

  if (!response.ok || !data.status) {
    throw new Error(data.message || "Paystack request failed")
  }

  return data.data
}

export async function initializePaystackTransaction(
  payload: InitializeTransactionPayload
) {
  return paystackRequest<PaystackInitializeData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function verifyPaystackTransaction(reference: string) {
  return paystackRequest<PaystackVerifyData>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  )
}
