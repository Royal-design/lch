import { requireAdmin } from "@/lib/auth-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
  const context = await requireAdmin()

  if (context.error) {
    return NextResponse.json({ error: context.error }, { status: context.status })
  }

  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: "Admin service client is not configured" },
      { status: 500 }
    )
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      id,
      user_id,
      amount,
      status,
      reference,
      description,
      gateway_response,
      metadata,
      created_at,
      profiles!transactions_user_id_fkey(full_name, email)
    `
    )
    .eq("type", "withdrawal")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "Unable to load withdrawals" },
      { status: 500 }
    )
  }

  const userIds = Array.from(new Set((data || []).map((row) => row.user_id)))
  const { data: wallets } =
    userIds.length > 0
      ? await supabase
          .from("wallets")
          .select("user_id, balance, locked_balance")
          .in("user_id", userIds)
      : { data: [] }
  const walletMap = new Map((wallets || []).map((wallet) => [wallet.user_id, wallet]))

  return NextResponse.json({
    withdrawals: (data || []).map((row) => ({
      ...row,
      wallet: walletMap.get(row.user_id) ?? null,
    })),
  })
}
