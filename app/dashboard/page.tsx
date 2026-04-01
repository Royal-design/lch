"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"

export default function DashboardPage() {
  const { user, loading, signOut } = useAuthStore()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
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

      {/* Main */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome 👋</CardTitle>
              <CardDescription>
                {`  You're successfully logged in. Here's your dashboard.`}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Stats */}
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
