"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Landmark, Wallet, Bell, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const mobileItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/contributions", label: "Plans", icon: Landmark },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet, isCenter: true },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href
  return pathname.startsWith(href)
}

export function MobileNavBar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-30 mx-auto w-[calc(100%-2rem)] max-w-lg lg:hidden select-none">
      {/* Background with Notch SVG */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Shadow layer */}
        <div className="absolute inset-x-4 top-2 bottom-0 rounded-[2rem] bg-black/10 dark:bg-black/40 blur-xl z-[-1]" />
        
        {/* SVG Curved Backdrop */}
        <svg
          className="w-full h-[4.75rem] text-white/94 dark:text-card/94 backdrop-blur-2xl"
          viewBox="0 0 350 68"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M 0,20 C 0,8.95 8.95,0 20,0 L 132,0 C 141,0 145,4 148,10 C 154,19 163,25 175,25 C 187,25 196,19 202,10 C 205,4 209,0 218,0 L 330,0 C 341.05,0 350,8.95 350,20 L 350,68 L 0,68 Z" />
        </svg>
        
        {/* Curved Border Overlay */}
        <svg
          className="absolute inset-0 w-full h-[4.75rem] pointer-events-none"
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

      {/* Navigation Links */}
      <div className="relative z-10 grid h-[4.75rem] grid-cols-5 items-center px-2">
        {mobileItems.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href)

          if (item.isCenter) {
            return (
              <div key={item.href} className="relative flex flex-col items-center justify-end pb-1.5 h-full">
                {/* Floating Elevated Button */}
                <Link href={item.href} className="absolute -top-[1.65rem] z-20">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={cn(
                      "flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.5)] border-4 border-white dark:border-[#151b2c] transition-all",
                      active && "ring-2 ring-primary/80 ring-offset-2 dark:ring-offset-[#0d121f]"
                    )}
                  >
                    <Icon className="size-6" strokeWidth={2.4} />
                  </motion.div>
                </Link>
                {/* Label below Notch */}
                <span
                  className={cn(
                    "text-[0.62rem] font-bold tracking-wide transition-colors duration-200",
                    active ? "text-primary dark:text-emerald-400" : "text-muted-foreground/80"
                  )}
                >
                  {item.label}
                </span>
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-1 h-full text-[0.62rem] font-bold transition-all duration-300",
                active ? "text-primary dark:text-emerald-400" : "text-muted-foreground/80 hover:text-foreground"
              )}
            >
              {/* Icon Container with subtle animation */}
              <motion.div
                animate={active ? { y: -2, scale: 1.06 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "relative z-10 flex size-10 items-center justify-center rounded-full transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(16,185,129,0.24)] dark:bg-emerald-500 dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.42)]"
                    : "text-muted-foreground/80 group-hover:bg-accent group-hover:text-accent-foreground"
                )}
              >
                <Icon className="size-[1.15rem]" strokeWidth={active ? 2.4 : 2} />
              </motion.div>

              <span className="relative z-10 tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
