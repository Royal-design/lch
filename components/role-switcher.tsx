"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiRequest } from "@/lib/api-client"
import { useAuthStore, type AuthProfile } from "@/store/useAuthStore"

function roleLabel(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { role, roles, setProfile } = useAuthStore()
  const [isPending, startTransition] = useTransition()

  if (roles.length <= 1 || !role) return null

  return (
    <Select
      value={role}
      disabled={isPending}
      onValueChange={(nextRole) => {
        if (nextRole === role) return

        startTransition(async () => {
          try {
            const data = await apiRequest<{
              profile: AuthProfile
              redirectTo: string
            }>("/api/auth/switch-role", {
              method: "POST",
              body: JSON.stringify({ role: nextRole }),
            })

            queryClient.clear()
            setProfile(data.profile)
            toast.success(`Switched to ${roleLabel(nextRole)} mode.`)
            router.replace(data.redirectTo)
            router.refresh()
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Unable to switch role"
            )
          }
        })
      }}
    >
      <SelectTrigger
        className={
          compact
            ? "h-9 w-[7.5rem] rounded-xl bg-card/80 px-3 text-xs"
            : "h-10 w-40 rounded-xl bg-card/80 px-3"
        }
      >
        <SelectValue placeholder="Switch role" />
      </SelectTrigger>
      <SelectContent position="popper">
        {roles.map((item) => (
          <SelectItem key={item} value={item}>
            {roleLabel(item)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
