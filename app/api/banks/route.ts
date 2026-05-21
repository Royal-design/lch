import { requireActiveUser } from "@/lib/auth-server"
import { getPaystackBanks } from "@/lib/paystack"
import { NextResponse } from "next/server"

// Cache in-memory to avoid fetching Paystack bank list on every request
let cachedBanks: { name: string; code: string }[] | null = null
let lastFetched = 0
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours

// Comprehensive fallback list of Nigerian banks
const FALLBACK_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Access Bank (Diamond)", code: "063" },
  { name: "ALAT by WEMA", code: "035A" },
  { name: "Carbon", code: "565" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank (FCMB)", code: "214" },
  { name: "Globus Bank", code: "00103" },
  { name: "Guaranty Trust Bank (GTBank)", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Moniepoint MFB", code: "50515" },
  { name: "OPay Digital Services (Paycom)", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Parallex Bank", code: "502" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Rubies MFB", code: "125" },
  { name: "Safe Haven MFB", code: "51252" },
  { name: "Stanbic IBTC Bank", code: "039" },
  { name: "Sterling Bank", code: "232" },
  { name: "Suntrust Bank", code: "100" },
  { name: "TAJ Bank", code: "302" },
  { name: "Titan Trust Bank", code: "102" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank for Africa (UBA)", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "VFD Microfinance Bank", code: "566" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
].sort((a, b) => a.name.localeCompare(b.name))

export async function GET() {
  const context = await requireActiveUser()

  if (context.error || !context.user) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const now = Date.now()
  if (cachedBanks && now - lastFetched < CACHE_TTL) {
    return NextResponse.json({ banks: cachedBanks })
  }

  try {
    const rawBanks = await getPaystackBanks()
    if (Array.isArray(rawBanks)) {
      const banks = rawBanks
        .map((b) => ({
          name: b.name,
          code: b.code,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      cachedBanks = banks
      lastFetched = now
      return NextResponse.json({ banks })
    }
  } catch (error) {
    console.error("Failed to fetch banks from Paystack, falling back to static list:", error)
  }

  return NextResponse.json({ banks: FALLBACK_BANKS })
}
