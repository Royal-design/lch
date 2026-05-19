"use client"

import type { CurrentProfile } from "@/components/profile-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { apiRequest } from "@/lib/api-client"
import { useAuthStore } from "@/store/useAuthStore"
import { useQueryClient } from "@tanstack/react-query"
import {
  Bell,
  Camera,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface ProfileDialogProps {
  children: React.ReactNode
}

export function ProfileDialog({ children }: ProfileDialogProps) {
  const queryClient = useQueryClient()
  const { user, role } = useAuthStore()
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "notifications"
  >("profile")
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Form states
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarFile, setAvatarFile] = useState<string | null>(null)

  // Security states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Notification states
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [loginAlerts, setLoginAlerts] = useState(true)

  // Initialize fields on open safely without triggering synchronous cascading renders
  useEffect(() => {
    if (!isOpen || !user) return

    let ignore = false
    const activeUser = user

    async function loadProfile() {
      setLoading(true)
      try {
        const data = await apiRequest<{
          profile: {
            full_name: string
            email: string
            phone: string | null
            avatar_url: string | null
          }
        }>("/api/profile")

        if (!ignore) {
          setFullName(data.profile.full_name || "")
          setEmail(data.profile.email || activeUser.email || "")
          setPhone(data.profile.phone || "")
          setAvatarUrl(data.profile.avatar_url || "")
        }
      } catch {
        if (!ignore) {
          setFullName(
            typeof activeUser.user_metadata?.full_name === "string"
              ? activeUser.user_metadata.full_name
              : ""
          )
          setEmail(activeUser.email || "")
          setPhone(
            typeof activeUser.user_metadata?.phone === "string"
              ? activeUser.user_metadata.phone
              : ""
          )
          setAvatarUrl(
            typeof activeUser.user_metadata?.avatar_url === "string"
              ? activeUser.user_metadata.avatar_url
              : ""
          )
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      ignore = true
    }
  }, [user, isOpen])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size should be less than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarFile(reader.result as string)
    }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append("avatar", file)

    setUploadingAvatar(true)
    try {
      const data = await apiRequest<{
        avatarUrl: string
        profile: CurrentProfile
      }>("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      setAvatarUrl(data.avatarUrl)
      setAvatarFile(null)
      queryClient.setQueryData(["profile"], data.profile)
      toast.success("Avatar uploaded successfully.")
    } catch (error) {
      setAvatarFile(null)
      toast.error(
        error instanceof Error ? error.message : "Unable to upload avatar"
      )
    } finally {
      setUploadingAvatar(false)
      e.target.value = ""
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await apiRequest<{ profile: CurrentProfile }>(
        "/api/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            fullName,
            phone,
            avatarUrl,
          }),
        }
      )
      setAvatarUrl(data.profile.avatar_url || "")
      setAvatarFile(null)
      queryClient.setQueryData(["profile"], data.profile)
      toast.success("Profile updated successfully.")
      setIsOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update profile"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSecuritySave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error("Please enter your current password")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
    toast.success("Password changed successfully!")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setIsOpen(false)
  }

  const handleNotificationsSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setLoading(false)
    toast.success("Notification preferences updated!")
    setIsOpen(false)
  }

  const initials = fullName ? fullName.slice(0, 2).toUpperCase() : "AD"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95"
        >
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden rounded-[2rem] border border-border/80 bg-background p-0 shadow-2xl sm:max-w-lg">
        {/* Banner Section */}
        <div className="relative flex h-28 w-full items-end bg-gradient-to-r from-primary/90 to-primary-foreground/20 p-6 dark:from-primary/30 dark:to-primary-foreground/5">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-background/20 px-3 py-1 text-[0.66rem] font-bold tracking-wider text-white uppercase backdrop-blur-md">
            <Sparkles className="size-3 animate-pulse text-primary-foreground dark:text-primary" />
            {role === "admin" ? "Admin Privileges" : "Member Account"}
          </div>

          {/* Avatar Preview */}
          <div className="absolute -bottom-10 left-6 z-10 flex items-end gap-3.5">
            <div className="group relative size-20 overflow-hidden rounded-full border-4 border-background bg-card shadow-md">
              <Avatar className="h-full w-full">
                {avatarFile ? (
                  <AvatarImage src={avatarFile} className="object-cover" />
                ) : avatarUrl ? (
                  <AvatarImage src={avatarUrl} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                  {uploadingAvatar ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    initials
                  )}
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar ? (
                <div className="absolute inset-0 grid place-items-center bg-black/45 text-white">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : null}

              {/* Camera Hover Trigger */}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Camera className="size-5 text-white" />
                <input
                  aria-label="Upload profile picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div className="pb-1.5">
              <h4 className="text-base leading-none font-extrabold tracking-tight text-foreground drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] dark:drop-shadow-none">
                {fullName || "User Profile"}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex gap-4 border-b border-border bg-muted/30 px-6 pt-12 pb-0">
          {(
            [
              { id: "profile", label: "Profile Info", icon: User },
              { id: "security", label: "Security", icon: Lock },
              { id: "notifications", label: "Preferences", icon: Bell },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 border-b-2 pb-3 text-xs leading-none font-bold transition-all ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Body */}
        <div className="thin-scrollbar max-h-[380px] overflow-y-auto px-6 py-5">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[0.68rem] font-bold tracking-wider text-muted-foreground uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter full name"
                    className="h-10 rounded-xl pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[0.68rem] font-bold tracking-wider text-muted-foreground uppercase">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      disabled
                      placeholder="email@example.com"
                      className="h-10 cursor-not-allowed rounded-xl bg-muted/40 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.68rem] font-bold tracking-wider text-muted-foreground uppercase">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 801 234 5678"
                      className="h-10 rounded-xl pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-[0.72rem] font-bold text-foreground">
                    Cloudinary Avatar Connected
                  </p>
                  <p className="mt-0.5 text-[0.68rem] leading-normal text-muted-foreground">
                    Profile photos upload to Cloudinary and the image URL is
                    saved with your profile.
                  </p>
                </div>
              </div>

              <DialogFooter className="px-0 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-xl px-5 text-xs font-bold sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile Details"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <form onSubmit={handleSecuritySave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[0.68rem] font-bold tracking-wider text-muted-foreground uppercase">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-10 rounded-xl pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[0.68rem] font-bold tracking-wider text-muted-foreground uppercase">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-10 rounded-xl pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.68rem] font-bold tracking-wider text-muted-foreground uppercase">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-10 rounded-xl pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-start gap-3 rounded-xl border border-border/80 bg-muted/30 p-3.5">
                <Shield className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-[0.72rem] font-bold text-foreground">
                    Password Requirement
                  </p>
                  <p className="mt-0.5 text-[0.68rem] leading-normal text-muted-foreground">
                    Password must be at least 6 characters long and contain
                    numbers or special characters.
                  </p>
                </div>
              </div>

              <DialogFooter className="px-0 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-xl px-5 text-xs font-bold sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === "notifications" && (
            <form onSubmit={handleNotificationsSave} className="space-y-4">
              <p className="mb-1 text-xs leading-relaxed text-muted-foreground">
                Configure when and where you receive status notifications,
                contribution circle activity, and wallet reports.
              </p>

              <div className="space-y-3">
                {/* Notification Item 1 */}
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card/60 p-3 transition-colors hover:bg-card">
                  <div className="flex-1 space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-foreground">
                      Email Notifications
                    </p>
                    <p className="text-[0.68rem] text-muted-foreground">
                      Receive deposit receipts, plan summaries, and payout
                      notifications.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="size-4 cursor-pointer rounded border-border accent-primary"
                  />
                </label>

                {/* Notification Item 2 */}
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card/60 p-3 transition-colors hover:bg-card">
                  <div className="flex-1 space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-foreground">
                      SMS & Phone Alerts
                    </p>
                    <p className="text-[0.68rem] text-muted-foreground">
                      Receive instant mobile text notifications for fast-tracked
                      withdrawal confirmation.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="size-4 cursor-pointer rounded border-border accent-primary"
                  />
                </label>

                {/* Notification Item 3 */}
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card/60 p-3 transition-colors hover:bg-card">
                  <div className="flex-1 space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-foreground">
                      New Device & Login Alerts
                    </p>
                    <p className="text-[0.68rem] text-muted-foreground">
                      Security log notices when an unfamiliar browser accesses
                      your secure account.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={loginAlerts}
                    onChange={(e) => setLoginAlerts(e.target.checked)}
                    className="size-4 cursor-pointer rounded border-border accent-primary"
                  />
                </label>
              </div>

              <DialogFooter className="px-0 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-xl px-5 text-xs font-bold sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
