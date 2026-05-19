"use client"

import { useQuery } from "@tanstack/react-query"
import { Mail, Phone, ShieldCheck, User } from "lucide-react"

import { SkeletonBlock } from "@/components/admin/admin-ui"
import { ModeToggle } from "@/components/mode-toggle"
import { fetchCurrentProfile } from "@/components/profile-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchCurrentProfile,
  })

  const email = user?.email ?? "member@lch.app"
  const metadataAvatar =
    typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null
  const avatarUrl = profile?.avatar_url ?? metadataAvatar
  const fullName =
    profile?.full_name ||
    (typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "LCH Member")
  const phone = profile?.phone ?? "Not added"
  const initials = (fullName || email).slice(0, 2).toUpperCase()
  const profileFields = [
    { icon: User, label: "Full name", value: fullName },
    { icon: Mail, label: "Email address", value: profile?.email ?? email },
    { icon: Phone, label: "Phone number", value: phone },
    { icon: ShieldCheck, label: "Security", value: "Supabase session protected" },
  ]

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.8fr_1fr]">
        <Card className="fintech-surface rounded-[1.35rem]">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <SkeletonBlock className="size-20 rounded-full" />
            <SkeletonBlock className="mt-4 h-7 w-44" />
            <SkeletonBlock className="mt-2 h-4 w-56" />
          </CardContent>
        </Card>
        <Card className="fintech-surface rounded-[1.35rem]">
          <CardHeader>
            <SkeletonBlock className="h-6 w-28" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.8fr_1fr]">
      <Card className="fintech-surface rounded-[1.35rem]">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <Avatar className="size-20 border border-border shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{fullName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
        </CardContent>
      </Card>
      <Card className="fintech-surface rounded-[1.35rem]">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {profileFields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-accent text-primary">
                  <Icon className="size-4" />
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <span className="text-right text-sm font-semibold">
                {label === "Email address" ? email : value}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-4">
            <div>
              <p className="text-sm font-semibold">Appearance</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Light, dark, or system theme
              </p>
            </div>
            <ModeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
