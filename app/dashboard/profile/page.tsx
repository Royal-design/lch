"use client"

import { useMutation } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, Loader2, Mail, Phone, ShieldCheck, Trash2, User } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { SkeletonBlock } from "@/components/admin/admin-ui"
import { ModeToggle } from "@/components/mode-toggle"
import { fetchCurrentProfile } from "@/components/profile-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiRequest } from "@/lib/api-client"
import { useAuthStore } from "@/store/useAuthStore"

export default function ProfilePage() {
  const { user, signOut } = useAuthStore()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchCurrentProfile,
  })
  const deleteAccountMutation = useMutation({
    mutationFn: () =>
      apiRequest<{ message: string }>("/api/profile", {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Your account was deleted. Email confirmation sent.")
      setDeleteDialogOpen(false)
      window.setTimeout(() => {
        void signOut()
      }, 900)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete account"
      )
    },
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
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Delete account
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Permanently remove your profile, wallet, contribution plans,
                  transactions, and notifications.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                className="rounded-xl"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive sm:mx-0">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle>Delete Your Account</DialogTitle>
            <DialogDescription>
              This action is permanent. Your wallet records, contribution plans,
              transactions, and notifications will be removed, and you will be
              signed out after the account is deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              disabled={deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
            >
              {deleteAccountMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
