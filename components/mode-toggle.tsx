"use client"

import * as React from "react"
import { Check, Laptop, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
]

export function ModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full bg-card/80"
        aria-label="Theme options"
        disabled
      >
        <Sun className="size-4" />
      </Button>
    )
  }

  const activeTheme = theme ?? "system"
  const ActiveIcon =
    themes.find((item) => item.value === activeTheme)?.icon ??
    (resolvedTheme === "dark" ? Moon : Sun)

  return (
    <Select value={activeTheme} onValueChange={setTheme}>
      <SelectTrigger
        aria-label="Choose color theme"
        className="h-9 w-auto gap-2 rounded-full border-border/80 bg-card/85 px-3 shadow-sm transition-colors hover:bg-accent dark:bg-card/75"
      >
        <ActiveIcon className="size-4 text-primary" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" position="popper" className="min-w-36">
        {themes.map((item) => {
          const Icon = item.icon

          return (
            <SelectItem key={item.value} value={item.value}>
              <Icon className="size-4 text-muted-foreground" />
              <span>{item.label}</span>
              <Check
                className={cn(
                  "ml-auto size-3.5 text-primary opacity-0",
                  activeTheme === item.value && "opacity-100"
                )}
              />
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
