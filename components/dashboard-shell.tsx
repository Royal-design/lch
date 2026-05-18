"use client"

import {
  Bell,
  CreditCard,
  Home,
  Landmark,
  LogOut,
  Settings,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { LchLogo } from "@/components/lch-logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"

const navItems = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: Home },
  {
    href: "/dashboard/contributions",
    label: "Contributions",
    shortLabel: "Plans",
    icon: Landmark,
  },
  { href: "/dashboard/wallet", label: "Wallet", shortLabel: "Wallet", icon: Wallet },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    shortLabel: "Ledger",
    icon: CreditCard,
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    shortLabel: "Alerts",
    icon: Bell,
  },
  { href: "/dashboard/profile", label: "Settings", shortLabel: "Profile", icon: Settings },
]

const mobileItems = navItems.filter((item) =>
  ["/dashboard", "/dashboard/contributions", "/dashboard/wallet", "/dashboard/notifications", "/dashboard/profile"].includes(
    item.href
  )
)

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href
  return pathname.startsWith(href)
}

function NavIcon({
  icon: Icon,
  active,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  active: boolean
}) {
  return (
    <span
      className={cn(
        "grid size-8 place-items-center rounded-lg border transition-colors",
        active
          ? "border-sidebar-primary/20 bg-sidebar-primary/18 text-sidebar-primary-foreground"
          : "border-sidebar-border bg-white/[0.04] text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-4" />
    </span>
  )
}

function MobileTabIcon({
  icon: Icon,
  active,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  active: boolean
}) {
  return (
    <span
      className={cn(
        "relative grid size-10 place-items-center rounded-[1.1rem] transition-all duration-300",
        active
          ? "bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(12,36,54,0.22)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
          : "bg-muted/60 text-muted-foreground ring-1 ring-border/80 group-hover:bg-accent group-hover:text-accent-foreground"
      )}
    >
      <span
        className={cn(
          "absolute inset-x-2 top-1 h-px rounded-full transition-opacity",
          active ? "bg-white/45 opacity-100" : "opacity-0"
        )}
      />
      <Icon className="size-[1.05rem]" strokeWidth={active ? 2.4 : 2} />
    </span>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading, initialized, signOut } = useAuthStore()
  const email = user?.email ?? "member@lch.app"
  const initials = email.slice(0, 2).toUpperCase()

  useEffect(() => {
    if (initialized && !loading && !user) {
      window.location.href = "/login"
    }
  }, [initialized, loading, user])

  if (loading || !initialized) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="size-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top_left,oklch(0.94_0.04_155),transparent_34rem),linear-gradient(180deg,var(--background),var(--muted))] text-foreground dark:bg-[radial-gradient(circle_at_top_left,oklch(0.24_0.05_155),transparent_32rem),linear-gradient(180deg,var(--background),oklch(0.12_0.018_245))]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground lg:block">
        <LchLogo />
        <nav className="mt-8 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex h-12 cursor-pointer items-center gap-3 rounded-2xl px-2 text-sm font-semibold text-sidebar-foreground/68 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/40",
                  active &&
                    "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-black/10 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                )}
              >
                <NavIcon icon={Icon} active={active} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-sidebar-border bg-sidebar-accent/90 p-4 shadow-2xl shadow-black/10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sidebar-primary">Protected workspace</p>
          <p className="mt-1 text-xs leading-5 text-sidebar-foreground/62">
            Wallet, savings, and contribution operations in one dashboard.
          </p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/78 backdrop-blur-2xl">
          <div className="flex h-[4.25rem] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden">
              <LchLogo compact />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Welcome back</p>
              <h1 className="text-lg font-bold tracking-tight">
                Financial command center
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button variant="outline" size="icon" className="rounded-xl">
                <Bell className="size-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Avatar className="size-10 border border-border shadow-sm shadow-slate-950/5">
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="hidden rounded-xl sm:inline-flex"
                onClick={signOut}
              >
                <LogOut className="size-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 pb-36 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7">
          {children}
        </main>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-36 bg-background/55 backdrop-blur-2xl [mask-image:linear-gradient(to_top,black_35%,transparent)] dark:bg-background/45 lg:hidden" />
      <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-30 rounded-[1.45rem] border border-white/75 bg-white/86 p-1.5 shadow-[0_22px_55px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-card/82 dark:shadow-[0_24px_60px_rgba(0,0,0,0.38)] lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {mobileItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex min-h-[4.65rem] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[1.1rem] text-[0.66rem] font-semibold leading-none text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                  active && "text-foreground"
                )}
              >
                <MobileTabIcon icon={Icon} active={active} />
                <span className="max-w-full truncate">{item.shortLabel}</span>
                <span
                  className={cn(
                    "h-1 w-1 rounded-full bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
