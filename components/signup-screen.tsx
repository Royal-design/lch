import { Landmark, LockKeyhole, ShieldCheck } from "lucide-react"

import { LchLogo } from "@/components/lch-logo"
import { ModeToggle } from "@/components/mode-toggle"
import { RegisterForm } from "@/components/register-form"

const trustItems = [
  { icon: Landmark, label: "Contribution plans" },
  { icon: LockKeyhole, label: "Locked savings" },
  { icon: ShieldCheck, label: "Trusted access" },
]

export function SignupScreen() {
  return (
    <main className="fintech-page grid min-h-svh lg:grid-cols-[0.92fr_1.08fr]">
      <section className="hidden border-r border-sidebar-border bg-sidebar p-10 text-sidebar-foreground lg:flex lg:flex-col">
        <LchLogo className="[&_span:first-child]:bg-sidebar-primary [&_span:first-child]:text-sidebar-primary-foreground [&_span:last-child_span]:text-sidebar-foreground/62" />
        <div className="my-auto max-w-lg space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-primary">
            Build financial discipline
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-balance">
            Create contribution plans with a premium dashboard foundation.
          </h1>
          <p className="text-lg leading-8 text-sidebar-foreground/68">
            Open your LCH workspace for wallet balances, locked savings,
            contribution circles, and transparent activity tracking.
          </p>
          <div className="grid gap-3">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/90 p-4 shadow-xl shadow-black/5">
                <span className="grid size-10 place-items-center rounded-xl bg-sidebar-primary/15 text-sidebar-primary">
                  <Icon className="size-5" />
                </span>
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-xl space-y-6">
          <div className="flex items-center justify-between">
            <LchLogo />
            <ModeToggle />
          </div>
          <RegisterForm />
        </div>
      </section>
    </main>
  )
}
