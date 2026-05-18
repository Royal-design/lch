"use client"

import { useEffect, useState } from "react"
import { Mail, Phone, ShieldCheck, User } from "lucide-react"

import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"

type Profile = {
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<Profile | null>(null)

  const userId = user?.id
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

  useEffect(() => {
    if (!userId) return

    let ignore = false

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone, avatar_url")
        .eq("id", userId)
        .single()

      if (!ignore) {
        setProfile(data)
      }
    }

    loadProfile()

    return () => {
      ignore = true
    }
  }, [userId])

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.8fr_1fr]">
      <Card className="fintech-surface rounded-3xl">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <Avatar className="size-20 border border-border">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{fullName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
        </CardContent>
      </Card>
      <Card className="fintech-surface rounded-3xl">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profileFields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-center gap-3">
                <Icon className="size-4 text-primary" />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <span className="text-right text-sm font-semibold">
                {label === "Email address" ? email : value}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4">
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
