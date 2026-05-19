"use client"

import {
  ArrowRight,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { LchLogo } from "@/components/lch-logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"

const trustMetrics = [
  { icon: LockKeyhole, label: "Locked savings", value: "NGN 320,000" },
  { icon: ShieldCheck, label: "Active plans", value: "4 running" },
  { icon: Fingerprint, label: "Secure auth", value: "Protected" },
]

export default function Home() {
  const router = useRouter()
  const { user, role, signOut, loading, initialized } = useAuthStore()

  useEffect(() => {
    if (initialized && !loading && user) {
      router.replace(role === "admin" ? "/admin" : "/dashboard")
    }
  }, [initialized, loading, role, router, user])

  return (
    <main className="fintech-page flex min-h-svh items-center justify-center px-4 py-4 text-foreground sm:px-6">
      <section className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        
        {/* Rebuilt Image Column - Left Side on Desktop, Hidden on Mobile */}
        <div className="hidden w-full lg:block">
          <Card className="fintech-surface overflow-hidden rounded-[2rem] border border-border/60 p-0 shadow-[0_32px_80px_rgba(15,23,42,0.12)]">
            <CardContent className="p-0">
              <div className="relative aspect-[4/3.3] w-full overflow-hidden">
                <img
                  src="/fintech_hero.png"
                  alt="LCH Premium Fintech Dashboard"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[0.66rem] font-bold tracking-[0.16em] text-primary uppercase">
                    Secured by LCH Vault
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold tracking-tight">
                    Smart savings, seamless contributions
                  </h3>
                  <p className="mt-1 text-[0.7rem] leading-4 text-muted-foreground">
                    Your portal to automated community savings, transparent ledgers, and real-time interest tracking. Get started today.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Card Column - Right Side on Desktop, Centered on Mobile */}
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 lg:mx-0">
          <div className="flex items-center justify-between">
            <LchLogo />
            <ModeToggle />
          </div>

          <Card className="fintech-surface rounded-2xl">
            <CardContent className="space-y-4.5 p-5 sm:p-6">
              <div className="space-y-2.5 text-center sm:text-left">
                <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-sm shadow-slate-950/10 sm:mx-0">
                  LCH
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary">
                    Welcome to Leenah Contribution Home
                  </p>
                  <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
                    Save, contribute, and track your money with confidence.
                  </h1>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  A modern fintech workspace for contribution plans, locked
                  savings, wallet balances, and transparent transactions.
                </p>
              </div>

              <div className="grid gap-2.5">
                {initialized && !loading && user ? (
                  <>
                    <Button asChild size="lg" className="h-11 rounded-xl text-sm">
                      <Link href={role === "admin" ? "/admin" : "/dashboard"}>
                        Go to Dashboard
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-11 rounded-xl bg-card text-sm"
                      onClick={signOut}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="h-11 rounded-xl text-sm">
                      <Link href="/login">
                        Login
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="h-11 rounded-xl bg-card text-sm"
                      disabled={initialized && loading}
                    >
                      <Link href="/signup">Create account</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Trust metrics relocated beautifully to the main section */}
              <div className="grid grid-cols-3 gap-2 text-left">
                {trustMetrics.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border/80 bg-muted/20 p-2.5"
                  >
                    <Icon className="size-3.5 text-primary" />
                    <p className="mt-1.5 text-[0.58rem] text-muted-foreground leading-tight">
                      {label}
                    </p>
                    <p className="mt-0.5 text-xs font-bold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                {[
                  ["NGN 2.4m", "Managed"],
                  ["18", "Plans"],
                  ["99.9%", "Uptime"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-muted/30 p-2.5"
                  >
                    <p className="text-xs font-bold">{value}</p>
                    <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </section>
    </main>
  )
}
