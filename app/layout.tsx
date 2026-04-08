import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import AuthProvider from "@/components/AuthProvider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Leenah Contribution Home",
    template: "%s | Leenah Contribution Home",
  },
  description: "Save Together. Grow Together. Join contribution groups, save consistently, and build financial discipline with ease.",
  keywords: ["savings", "contributions", "fintech", "community savings", "Leenah", "LCH"],
  authors: [{ name: "Leenah Team" }],
  creator: "Leenah Contribution Home",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://leenah-ch.vercel.app",
    title: "Leenah Contribution Home - Save Together. Grow Together.",
    description: "The modern way to manage group contributions and savings.",
    siteName: "Leenah Contribution Home",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leenah Contribution Home",
    description: "The modern way to manage group contributions and savings.",
  },
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <main>{children}</main>
          </AuthProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
