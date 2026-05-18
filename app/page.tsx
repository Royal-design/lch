import {
  ArrowRight,
  Bell,
  Eye,
  Fingerprint,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react"
import Link from "next/link"

import { LchLogo } from "@/components/lch-logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const transactions = [
  { title: "Ajo contribution", amount: "+ ₦25,000", status: "Successful" },
  { title: "Locked savings", amount: "₦120,000", status: "Active" },
  { title: "Wallet deposit", amount: "+ ₦40,000", status: "Settled" },
]

const trustMetrics = [
  { icon: LockKeyhole, label: "Locked savings", value: "₦320,000" },
  { icon: ShieldCheck, label: "Active plans", value: "4 running" },
  { icon: Fingerprint, label: "Secure auth", value: "Protected" },
]

export default function Home() {
  return (
    <main className="fintech-page flex min-h-svh items-center justify-center px-4 py-6 text-foreground sm:px-6">
      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 lg:mx-0">
          <div className="flex items-center justify-between">
            <LchLogo />
            <ModeToggle />
          </div>

          <Card className="fintech-surface rounded-3xl">
            <CardContent className="space-y-7 p-6 sm:p-8">
              <div className="space-y-3 text-center sm:text-left">
                <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary text-lg font-black text-primary-foreground shadow-lg shadow-emerald-900/15 sm:mx-0">
                  LCH
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Welcome to Leenah Contribution Home
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                    Save, contribute, and track your money with confidence.
                  </h1>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  A modern fintech workspace for contribution plans, locked
                  savings, wallet balances, and transparent transactions.
                </p>
              </div>

              <div className="grid gap-3">
                <Button asChild size="lg" className="h-12 rounded-2xl">
                  <Link href="/login">
                    Login
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-2xl bg-card/80"
                >
                  <Link href="/signup">Create account</Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ["₦2.4m", "Managed"],
                  ["18", "Plans"],
                  ["99.9%", "Uptime"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-muted/50 p-3"
                  >
                    <p className="text-sm font-bold">{value}</p>
                    <p className="mt-1 text-[0.72rem] text-muted-foreground">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <Card className="fintech-surface rounded-[2rem]">
            <CardContent className="space-y-5 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    ₦842,500.00
                  </p>
                </div>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Eye className="size-4" />
                  <span className="sr-only">Hide balance</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button className="h-11 rounded-2xl">
                  <Plus className="size-4" />
                  Deposit
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-2xl bg-background/60"
                >
                  <Wallet className="size-4" />
                  Withdraw
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {trustMetrics.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-muted/40 p-4"
                  >
                    <Icon className="size-4 text-primary" />
                    <p className="mt-3 text-xs text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-border bg-background/65 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold">Recent activity</h2>
                  <Bell className="size-4 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  {transactions.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-2xl bg-card p-3 ring-1 ring-border/70"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.status}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-primary">
                        {item.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
