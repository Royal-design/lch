"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userName = user.user_metadata?.name || user.email || "User"

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">MyApp</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-2xl">
                Welcome back, {userName}! 👋
              </CardTitle>
              <CardDescription>
                You're successfully logged in. Here's your dashboard.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No projects yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No tasks created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Just you!</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
