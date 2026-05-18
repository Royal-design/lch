import Link from "next/link"

import { cn } from "@/lib/utils"

export function LchLogo({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      aria-label="Leenah Contribution Home"
    >
      <span className="grid size-10 place-items-center rounded-2xl bg-primary text-sm font-black tracking-tight text-primary-foreground shadow-sm shadow-emerald-900/20 transition-colors group-hover:bg-primary/90">
        LCH
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight">
            Leenah Contribution
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Home
          </span>
        </span>
      )}
    </Link>
  )
}
