"use client"

import {
  Bell,
  Search,
  Settings,
  LogOut,
  ChartNoAxesCombined,
  Users,
  CreditCard,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { adminNavItems } from "@/components/admin/admin-data"
import { LchLogo } from "@/components/lch-logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useEffect } from "react"

const mobileAdminItems = [
  { href: "/admin", label: "Overview", shortLabel: "Home", icon: ChartNoAxesCombined },
  { href: "/admin/users", label: "Users", shortLabel: "Users", icon: Users },
  { href: "/admin/transactions", label: "Transactions", shortLabel: "Ledger", icon: CreditCard },
  { href: "/admin/withdrawals", label: "Withdrawals", shortLabel: "Payouts", icon: Wallet },
  { href: "/admin/settings", label: "Settings", shortLabel: "Setup", icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href
  return pathname.startsWith(href)
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

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, loading, initialized, signOut } = useAuthStore()

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.replace("/login")
    }
  }, [initialized, loading, router, user])

  useEffect(() => {
    if (initialized && !loading && user && role === "user") {
      router.replace("/dashboard")
    }
  }, [initialized, loading, role, router, user])

  if (loading || !initialized || !user || role !== "admin") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="size-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top_left,oklch(0.94_0.035_155),transparent_32rem),linear-gradient(180deg,var(--background),var(--muted))] dark:bg-[radial-gradient(circle_at_top_left,oklch(0.23_0.05_155),transparent_30rem),linear-gradient(180deg,var(--background),oklch(0.12_0.018_245))]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex lg:flex-col">
        <LchLogo />
        <div className="mt-6 rounded-2xl border border-sidebar-border bg-sidebar-accent/80 p-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-sidebar-primary uppercase">
            Admin Control
          </p>
          <p className="mt-1 text-xs leading-5 text-sidebar-foreground/62">
            Financial operations, risk review, and platform performance.
          </p>
        </div>
        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto thin-scrollbar">
          {adminNavItems
            .filter(
              (item) =>
                !["/admin/notifications", "/admin/settings"].includes(item.href)
            )
            .map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href)

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-sidebar-foreground/68 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/35 focus-visible:outline-none",
                    active &&
                      "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-black/10 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              )
            })}
        </nav>
        <div className="mt-auto border-t border-sidebar-border pt-3">
          <Link
            href="/admin/notifications"
            className={cn(
              "group flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-sidebar-foreground/68 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/35 focus-visible:outline-none",
              isActive(pathname, "/admin/notifications") &&
                "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-black/10 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            )}
          >
            <Bell className="size-4" />
            Notifications
          </Link>
          <Link
            href="/admin/settings"
            className={cn(
              "group flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-sidebar-foreground/68 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/35 focus-visible:outline-none",
              isActive(pathname, "/admin/settings") &&
                "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-black/10 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            )}
          >
            <Settings className="size-4" />
            Settings
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/78 backdrop-blur-2xl">
          <div className="flex min-h-[4.5rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Leenah Contribution Home
              </p>
              <h1 className="text-xl font-bold tracking-tight">
                Admin financial control center
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users, refs, plans"
                  className="h-10 w-72 rounded-full bg-card/80 pl-9"
                />
              </div>
              <ModeToggle />
              <Button variant="outline" size="icon" className="rounded-xl">
                <Bell className="size-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Avatar className="size-10 border border-border">
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  AD
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl inline-flex"
                onClick={signOut}
              >
                <LogOut className="size-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 pt-5 pb-36 sm:px-6 lg:px-8 lg:pt-7 lg:pb-10">
          {children}
        </main>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-36 bg-background/55 [mask-image:linear-gradient(to_top,black_35%,transparent)] backdrop-blur-2xl lg:hidden dark:bg-background/45" />
      <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-30 rounded-[1.45rem] border border-white/75 bg-white/86 p-1.5 shadow-[0_22px_55px_rgba(15,23,42,0.16)] backdrop-blur-2xl lg:hidden dark:border-white/10 dark:bg-card/82 dark:shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {mobileAdminItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex min-h-[4.65rem] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[1.1rem] text-[0.66rem] leading-none font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none",
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
