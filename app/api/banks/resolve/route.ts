import { requireActiveUser } from "@/lib/auth-server"
import { resolveBankAccount } from "@/lib/paystack"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const { searchParams } = request.nextUrl
  const accountNumber = searchParams.get("account_number")
  const bankCode = searchParams.get("bank_code")

  if (!accountNumber || !bankCode) {
    return NextResponse.json(
      { error: "Account number and bank code are required" },
      { status: 400 }
    )
  }

  if (!/^[0-9]{10}$/.test(accountNumber)) {
    return NextResponse.json(
      { error: "Account number must be exactly 10 digits" },
      { status: 400 }
    )
  }

  try {
    const resolved = await resolveBankAccount(accountNumber, bankCode)
    if (resolved && resolved.account_name) {
      return NextResponse.json({
        accountName: resolved.account_name,
        accountNumber: resolved.account_number,
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to resolve account name"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  return NextResponse.json(
    { error: "Could not resolve bank account name" },
    { status: 400 }
  )
}
