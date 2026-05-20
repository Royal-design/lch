"use client"

import { Button } from "@/components/ui/button"
import { LchLogo } from "@/components/lch-logo"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import MaxWidthWrapper from "./MaxWidthWrapper"
import { useAuthStore } from "@/store/useAuthStore"
import { ModeToggle } from "../mode-toggle"

export default function Navbar() {
  const { user, role, initialized, loading } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dashboardHref = role === "admin" ? "/admin" : "/dashboard"

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-border/70 bg-background/84 backdrop-blur-2xl shadow-sm"
          : "border-transparent bg-transparent"
      }`}
    >
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <LchLogo compact={false} />

          <div className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-6">
              {[
                ["Home", "/"],
                ["Features", "#features"],
                ["How It Works", "#how-it-works"],
                ["FAQ", "#faq"],
              ].map(([name, url]) => (
                <Link
                  key={name}
                  href={url}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {name}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-4">
              <ModeToggle />
              <div className="flex items-center gap-3">
                {!initialized || loading ? (
                  <div className="h-8 w-32 rounded-full bg-muted/70" />
                ) : user ? (
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full px-5 font-semibold active:scale-95 transition-all"
                  >
                    <Link href={dashboardHref}>Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="font-medium hover:text-foreground"
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full px-5 font-semibold active:scale-95 transition-all"
                    >
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <button
              className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </MaxWidthWrapper>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full animate-in slide-in-from-top-2 border-b border-border bg-background p-4 shadow-xl md:hidden">
          <div className="flex flex-col gap-4">
            {[
              ["Home", "/"],
              ["Features", "#features"],
              ["How It Works", "#how-it-works"],
              ["FAQ", "#faq"],
            ].map(([name, url]) => (
              <Link
                key={name}
                href={url}
                className="px-4 py-2 text-sm font-medium transition-colors hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {name}
              </Link>
            ))}
            <hr className="border-border" />
            {!initialized || loading ? (
              <div className="h-10 rounded-full bg-muted/70" />
            ) : user ? (
              <Button
                asChild
                className="rounded-full font-semibold"
                onClick={() => setIsOpen(false)}
              >
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start px-4"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
