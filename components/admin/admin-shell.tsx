"use client"

import { Bell, Search } from "lucide-react"
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

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href
  return pathname.startsWith(href)
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, loading, initialized } = useAuthStore()

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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground lg:block">
        <LchLogo />
        <div className="mt-6 rounded-2xl border border-sidebar-border bg-sidebar-accent/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sidebar-primary">
            Admin Control
          </p>
          <p className="mt-1 text-xs leading-5 text-sidebar-foreground/62">
            Financial operations, risk review, and platform performance.
          </p>
        </div>
        <nav className="mt-5 space-y-1">
          {adminNavItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href)

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-sidebar-foreground/68 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/35",
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
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/78 backdrop-blur-2xl">
          <div className="flex min-h-[4.5rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Leenah Contribution Home
              </p>
              <h1 className="text-xl font-bold tracking-tight">
                Admin financial control center
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
            </div>
          </div>
        </header>

        <main className="px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-7">
          {children}
        </main>
      </div>
    </div>
  )
}
