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
    <main className="fintech-page grid min-h-svh lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden border-r border-border/70 bg-primary p-10 text-primary-foreground lg:flex lg:flex-col">
        <LchLogo className="text-primary-foreground [&_span:first-child]:bg-white [&_span:first-child]:text-emerald-800 [&_span:last-child_span]:text-primary-foreground/70" />
        <div className="my-auto max-w-lg space-y-6">
          <p className="text-sm font-semibold text-primary-foreground/75">
            Secure fintech access
          </p>
          <h1 className="text-5xl font-bold tracking-tight">
            Your contribution home, ready whenever you are.
          </h1>
          <p className="text-lg leading-8 text-primary-foreground/72">
            Sign in to view balances, locked savings, contribution progress,
            and transaction activity in one calm workspace.
          </p>
          <div className="grid gap-3">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/14 bg-white/10 p-4">
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
