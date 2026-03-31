"use client"

import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
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

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // If user is logged in, they'll be redirected to dashboard
  // This shows only for unauthenticated users
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to MyApp</CardTitle>
          <CardDescription>
            Your all-in-one application for managing projects and tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Features:</p>
            <ul className="mt-2 space-y-1">
              <li>✓ Project Management</li>
              <li>✓ Task Tracking</li>
              <li>✓ Team Collaboration</li>
              <li>✓ Real-time Updates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
