"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import MaxWidthWrapper from "./MaxWidthWrapper"
import { useAuthStore } from "@/store/useAuthStore"

export default function Navbar() {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
          ? "border-emerald-100 bg-white/70 backdrop-blur-md shadow-sm"
          : "border-transparent bg-transparent"
      }`}
    >
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 transition-colors group-hover:text-emerald-700">
              LCH
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-6">
              {[
                ["Home", "/"],
                ["Features", "#features"],
                ["How It Works", "#how-it-works"],
                ["Pricing", "#pricing"],
                ["FAQ", "#faq"],
              ].map(([name, url]) => (
                <Link
                  key={name}
                  href={url}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-emerald-600"
                >
                  {name}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-emerald-100" />

            <div className="flex items-center gap-3">
              {user ? (
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-emerald-600 px-5 font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="font-medium hover:text-emerald-600"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full bg-emerald-600 px-5 font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-all hover:bg-emerald-50 hover:text-emerald-600 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </MaxWidthWrapper>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full animate-in slide-in-from-top-2 border-b bg-white p-4 shadow-xl md:hidden">
          <div className="flex flex-col gap-4">
            {[
              ["Home", "/"],
              ["Features", "#features"],
              ["How It Works", "#how-it-works"],
              ["Pricing", "#pricing"],
              ["FAQ", "#faq"],
            ].map(([name, url]) => (
              <Link
                key={name}
                href={url}
                className="px-4 py-2 text-sm font-medium transition-colors hover:text-emerald-600"
                onClick={() => setIsOpen(false)}
              >
                {name}
              </Link>
            ))}
            <hr className="border-emerald-50" />
            {user ? (
              <Button
                asChild
                className="rounded-full bg-emerald-600 font-semibold hover:bg-emerald-700"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start px-4 text-emerald-600"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full bg-emerald-600 font-semibold hover:bg-emerald-700"
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
