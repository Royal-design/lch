import { LockKeyhole, ShieldCheck, Wallet } from "lucide-react"

import { LchLogo } from "@/components/lch-logo"
import { LoginForm } from "@/components/login-form"
import { ModeToggle } from "@/components/mode-toggle"

const trustItems = [
  { icon: Wallet, label: "Wallet balances" },
  { icon: LockKeyhole, label: "Locked savings" },
  { icon: ShieldCheck, label: "Protected session" },
]

export default function LoginPage() {
  return (
    <main className="fintech-page grid min-h-svh lg:grid-cols-[0.92fr_1.08fr]">
      <section className="hidden border-r border-sidebar-border bg-sidebar p-10 text-sidebar-foreground lg:flex lg:flex-col">
        <LchLogo className="[&_span:first-child]:text-sidebar-primary-foreground [&_span:last-child_span]:text-sidebar-foreground/62" />
        <div className="my-auto max-w-lg space-y-6">
          <p className="text-sm font-semibold text-sidebar-foreground/65">
            Secure fintech access
          </p>
          <h1 className="text-5xl font-bold tracking-tight">
            Your contribution home, ready whenever you are.
          </h1>
          <p className="text-lg leading-8 text-sidebar-foreground/68">
            Sign in to view balances, locked savings, contribution progress, and
            transaction activity in one calm workspace.
          </p>
          <div className="grid gap-3">
            {trustItems.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent p-4"
              >
                <Icon className="size-5" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-between">
            <LchLogo />
            <ModeToggle />
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
