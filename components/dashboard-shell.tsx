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
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/contributions", label: "Contributions", icon: Landmark },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transactions", icon: CreditCard },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Settings", icon: Settings },
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
    <div className="min-h-svh bg-muted/40 text-foreground dark:bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border bg-sidebar/95 px-4 py-5 backdrop-blur xl:block">
        <LchLogo />
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium text-sidebar-foreground/72 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active &&
                    "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-emerald-900/15 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-3xl border border-sidebar-border bg-sidebar-accent/70 p-4">
          <p className="text-xs font-semibold text-sidebar-foreground">
            LCH protected workspace
          </p>
          <p className="mt-1 text-xs leading-5 text-sidebar-foreground/62">
            Theme-aware wallet, savings, and contribution dashboard foundation.
          </p>
        </div>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/82 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="xl:hidden">
              <LchLogo compact />
            </div>
            <div className="hidden xl:block">
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h1 className="text-lg font-semibold tracking-tight">
                Financial dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button variant="outline" size="icon" className="rounded-full">
                <Bell className="size-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="hidden rounded-full sm:inline-flex"
                onClick={signOut}
              >
                <LogOut className="size-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 pb-28 pt-5 sm:px-6 lg:px-8 xl:pb-10">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/92 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 backdrop-blur-xl xl:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {mobileItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.68rem] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  active && "bg-primary/10 text-primary"
                )}
              >
                <Icon className="size-5" />
                <span>{item.label === "Contributions" ? "Plans" : item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
