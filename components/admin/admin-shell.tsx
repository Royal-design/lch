"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Bell,
  ChartNoAxesCombined,
  CreditCard,
  HandCoins,
  LogOut,
  Search,
  Settings,
  Users,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { adminNavItems } from "@/components/admin/admin-data"
import { AdminHeaderSkeleton, SkeletonBlock } from "@/components/admin/admin-ui"
import { LchLogo } from "@/components/lch-logo"
import { ModeToggle } from "@/components/mode-toggle"
import { ProfileDialog } from "@/components/profile-dialog"
import { fetchCurrentProfile } from "@/components/profile-query"
import { RoleSwitcher } from "@/components/role-switcher"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useEffect } from "react"

const mobileAdminItems = [
  {
    href: "/admin",
    label: "Overview",
    shortLabel: "Home",
    icon: ChartNoAxesCombined,
  },
  { href: "/admin/users", label: "Users", shortLabel: "Users", icon: Users },
  {
    href: "/admin/transactions",
    label: "Transactions",
    shortLabel: "Ledger",
    icon: CreditCard,
    isCenter: true,
  },
  {
    href: "/admin/contributions",
    label: "Contributions",
    shortLabel: "Contrib",
    icon: HandCoins,
  },
  {
    href: "/admin/withdrawals",
    label: "Withdrawals",
    shortLabel: "Payouts",
    icon: Wallet,
  },
]

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href
  return pathname.startsWith(href)
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, loading, initialized, signOut } = useAuthStore()
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchCurrentProfile,
    enabled: Boolean(user),
  })
  const email = user?.email ?? "admin@lch.app"
  const displayName =
    profile?.full_name ||
    (typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : email)
  const avatarUrl =
    profile?.avatar_url ||
    (typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null)
  const initials = displayName.slice(0, 2).toUpperCase()

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.replace("/login")
    }
  }, [initialized, loading, router, user])

  useEffect(() => {
    if (initialized && !loading && user && role !== "admin") {
      router.replace("/dashboard")
    }
  }, [initialized, loading, role, router, user])

  if (!initialized || (loading && !user) || !user || role !== "admin") {
    return (
      <div className="min-h-svh bg-[radial-gradient(circle_at_top_left,oklch(0.94_0.035_155),transparent_32rem),linear-gradient(180deg,var(--background),var(--muted))] p-4 sm:p-6 lg:p-8 dark:bg-[radial-gradient(circle_at_top_left,oklch(0.23_0.05_155),transparent_30rem),linear-gradient(180deg,var(--background),oklch(0.12_0.018_245))]">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
            <div className="hidden space-y-4 rounded-[1.35rem] border border-sidebar-border bg-sidebar p-4 lg:block">
              <SkeletonBlock className="h-9 w-36" />
              <SkeletonBlock className="h-20 w-full" />
              {Array.from({ length: 7 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-11 w-full" />
              ))}
            </div>
            <div className="space-y-6">
              <div className="rounded-[1.35rem] border border-border/60 bg-background/78 p-5 backdrop-blur-2xl">
                <AdminHeaderSkeleton />
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[1.1rem] border border-border bg-card p-5"
                  >
                    <SkeletonBlock className="size-11 rounded-2xl" />
                    <SkeletonBlock className="mt-4 h-4 w-24" />
                    <SkeletonBlock className="mt-2 h-7 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
        <nav className="thin-scrollbar mt-5 flex-1 space-y-1 overflow-y-auto">
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
          <div className="flex h-[4.25rem] items-center justify-between px-4 sm:px-6 lg:h-auto lg:min-h-[4.5rem] lg:flex-row lg:px-8 lg:py-3">
            <div className="lg:hidden">
              <ProfileDialog>
                <Avatar className="size-10 cursor-pointer border border-border shadow-sm shadow-slate-950/5 transition-transform hover:scale-105">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </ProfileDialog>
            </div>
            <div className="hidden lg:block">
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
              <RoleSwitcher compact />
              <Button variant="outline" size="icon" className="rounded-xl">
                <Bell className="size-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <div className="hidden lg:block">
                <ProfileDialog>
                  <Avatar className="size-10 cursor-pointer border border-border transition-transform hover:scale-105">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </ProfileDialog>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="inline-flex rounded-xl"
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
      <nav className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-30 mx-auto w-[calc(100%-2rem)] max-w-lg select-none lg:hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-x-4 top-2 bottom-0 z-[-1] rounded-[2rem] bg-black/10 blur-xl dark:bg-black/40" />
          <svg
            className="h-[4.75rem] w-full text-white/94 backdrop-blur-2xl dark:text-card/94"
            viewBox="0 0 350 68"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M 0,20 C 0,8.95 8.95,0 20,0 L 132,0 C 141,0 145,4 148,10 C 154,19 163,25 175,25 C 187,25 196,19 202,10 C 205,4 209,0 218,0 L 330,0 C 341.05,0 350,8.95 350,20 L 350,68 L 0,68 Z" />
          </svg>
          <svg
            className="pointer-events-none absolute inset-0 h-[4.75rem] w-full"
            viewBox="0 0 350 68"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,20 C 0,8.95 8.95,0 20,0 L 132,0 C 141,0 145,4 148,10 C 154,19 163,25 175,25 C 187,25 196,19 202,10 C 205,4 209,0 218,0 L 330,0 C 341.05,0 350,8.95 350,20"
              fill="none"
              stroke="currentColor"
              className="text-black/[0.06] dark:text-white/[0.08]"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        <div className="relative z-10 grid h-[4.75rem] grid-cols-5 items-center px-2">
          {mobileAdminItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)

            if (item.isCenter) {
              return (
                <div
                  key={item.href}
                  className="relative flex h-full flex-col items-center justify-end pb-1.5"
                >
                  <Link
                    href={item.href}
                    className="absolute -top-[1.65rem] z-20"
                  >
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      className={cn(
                        "flex size-14 items-center justify-center rounded-full border-4 border-white bg-gradient-to-tr from-primary to-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all dark:border-[#151b2c] dark:shadow-[0_10px_25px_rgba(0,0,0,0.5)]",
                        active &&
                          "ring-2 ring-primary/80 ring-offset-2 dark:ring-offset-[#0d121f]"
                      )}
                    >
                      <Icon className="size-6" strokeWidth={2.4} />
                    </motion.div>
                  </Link>
                  <span
                    className={cn(
                      "text-[0.62rem] font-bold tracking-wide transition-colors duration-200",
                      active
                        ? "text-primary dark:text-emerald-400"
                        : "text-muted-foreground/80"
                    )}
                  >
                    {item.shortLabel}
                  </span>
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex h-full cursor-pointer flex-col items-center justify-center gap-1 text-[0.62rem] font-bold transition-all duration-300 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none",
                  active
                    ? "text-primary dark:text-emerald-400"
                    : "text-muted-foreground/80 hover:text-foreground"
                )}
              >
                <motion.span
                  animate={active ? { y: -2, scale: 1.06 } : { y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "relative z-10 grid size-10 place-items-center rounded-full transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(16,185,129,0.24)] dark:bg-emerald-500 dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.42)]"
                      : "text-muted-foreground/80 group-hover:bg-accent group-hover:text-accent-foreground"
                  )}
                >
                  <Icon
                    className="size-[1.15rem]"
                    strokeWidth={active ? 2.4 : 2}
                  />
                </motion.span>
                <span className="relative z-10 max-w-full truncate tracking-wide">
                  {item.shortLabel}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
