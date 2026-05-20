"use client"

import { LchLogo } from "@/components/lch-logo"
import { cn } from "@/lib/utils"

type AppLoadingScreenProps = {
  title?: string
  message?: string
  className?: string
}

export function AppLoadingScreen({
  title = "Preparing your workspace",
  message = "Checking your secure session and loading live account data.",
  className,
}: AppLoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top_left,oklch(0.94_0.04_155),transparent_34rem),linear-gradient(180deg,var(--background),var(--muted))] px-4 text-foreground dark:bg-[radial-gradient(circle_at_top_left,oklch(0.24_0.05_155),transparent_32rem),linear-gradient(180deg,var(--background),oklch(0.12_0.018_245))]",
        className
      )}
    >
      <div className="w-full max-w-sm rounded-[1.5rem] border border-border/75 bg-card/88 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:bg-card/72 dark:shadow-black/35">
        <div className="flex items-center justify-between gap-4">
          <LchLogo />
          <div className="relative grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
            <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
            <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm font-bold">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        </div>

        <div className="mt-6 space-y-2.5">
          <div className="h-3 w-11/12 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-8/12 animate-pulse rounded-full bg-muted/80" />
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="h-14 animate-pulse rounded-2xl bg-muted/70" />
            <div className="h-14 animate-pulse rounded-2xl bg-muted/70" />
            <div className="h-14 animate-pulse rounded-2xl bg-muted/70" />
          </div>
        </div>
      </div>
    </div>
  )
}
