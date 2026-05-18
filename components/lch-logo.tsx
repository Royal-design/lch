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
        "group inline-flex items-center gap-2.5 rounded-xl focus-visible:ring-3 focus-visible:ring-ring/35 focus-visible:outline-none",
        className
      )}
      aria-label="Leenah Contribution Home"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-black tracking-tight text-primary-foreground shadow-[0_12px_26px_rgba(7,95,63,0.22)] transition-colors group-hover:bg-primary/90">
        LCH
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight text-current">
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
