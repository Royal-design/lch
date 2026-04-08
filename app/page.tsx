"use client"



import { useAuthStore } from "@/store/useAuthStore"
import Navbar from "@/components/landing/Navbar"
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import HowItWorks from "@/components/landing/HowItWorks"
import Testimonials from "@/components/landing/Testimonials"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"

export default function Home() {
  const { loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    )
  }


  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 selection:dark:bg-emerald-900 selection:dark:text-emerald-100">
      <Navbar />
      <main className="grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
