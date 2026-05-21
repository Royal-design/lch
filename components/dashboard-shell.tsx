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
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { AppLoadingScreen } from "@/components/app-loading-screen"
import { LchLogo } from "@/components/lch-logo"
import { ModeToggle } from "@/components/mode-toggle"
import { fetchCurrentProfile } from "@/components/profile-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { ProfileDialog } from "@/components/profile-dialog"
import { RoleSwitcher } from "@/components/role-switcher"
import { MobileNavBar } from "@/components/mobile-nav-bar"

const navItems = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: Home },
  {
    href: "/dashboard/contributions",
    label: "Contributions",
    shortLabel: "Plans",
    icon: Landmark,
  },
  {
    href: "/dashboard/wallet",
    label: "Wallet",
    shortLabel: "Wallet",
    icon: Wallet,
  },
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
  {
    href: "/dashboard/profile",
    label: "Settings",
    shortLabel: "Profile",
    icon: Settings,
  },
]

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

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, loading, initialized, signOut } = useAuthStore()
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchCurrentProfile,
    enabled: Boolean(user),
  })
  const email = user?.email ?? "member@lch.app"
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
    if (initialized && !loading && user && role === "admin") {
      router.replace("/admin")
    }
  }, [initialized, loading, role, router, user])

  if (!initialized || (loading && !user)) {
    return (
      <AppLoadingScreen
        title="Opening your dashboard"
        message="Reading your session and preparing your contribution workspace."
      />
    )
  }

  if (!user) return null

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top_left,oklch(0.94_0.04_155),transparent_34rem),linear-gradient(180deg,var(--background),var(--muted))] text-foreground dark:bg-[radial-gradient(circle_at_top_left,oklch(0.24_0.05_155),transparent_32rem),linear-gradient(180deg,var(--background),oklch(0.12_0.018_245))]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex lg:flex-col">
        <LchLogo />
        <nav className="mt-8 flex-1 space-y-1.5 overflow-y-auto thin-scrollbar">
          {navItems
            .filter(
              (item) =>
                !["/dashboard/notifications", "/dashboard/profile"].includes(
                  item.href
                )
            )
            .map((item) => {
              const Icon = item.icon
              const active = isActive(pathname, item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex h-12 cursor-pointer items-center gap-3 rounded-2xl px-2 text-sm font-semibold text-sidebar-foreground/68 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/40 focus-visible:outline-none",
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
        <div className="mt-auto border-t border-sidebar-border pt-3">
          <Link
            href="/dashboard/notifications"
            className={cn(
              "group flex h-12 cursor-pointer items-center gap-3 rounded-2xl px-2 text-sm font-semibold text-sidebar-foreground/68 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/40 focus-visible:outline-none",
              isActive(pathname, "/dashboard/notifications") &&
                "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-black/10 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            )}
          >
            <NavIcon
              icon={Bell}
              active={isActive(pathname, "/dashboard/notifications")}
            />
            Notifications
          </Link>
          <Link
            href="/dashboard/profile"
            className={cn(
              "group flex h-12 cursor-pointer items-center gap-3 rounded-2xl px-2 text-sm font-semibold text-sidebar-foreground/68 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/40 focus-visible:outline-none",
              isActive(pathname, "/dashboard/profile") &&
                "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-black/10 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            )}
          >
            <NavIcon
              icon={Settings}
              active={isActive(pathname, "/dashboard/profile")}
            />
            Settings
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/78 backdrop-blur-2xl">
          <div className="flex h-[4.25rem] items-center justify-between px-4 sm:px-6 lg:px-8">
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
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Welcome back
              </p>
              <h1 className="text-lg font-bold tracking-tight">
                Financial command center
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <RoleSwitcher compact />
              <Button variant="outline" size="icon" className="rounded-xl">
                <Bell className="size-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <div className="hidden lg:block">
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
      <MobileNavBar />
    </div>
  )
}
