import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import AuthProvider from "@/components/AuthProvider"
import { QueryProvider } from "@/components/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import "./globals.css"

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://leenah-ch.vercel.app"
)

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "Leenah Contribution Home",
  title: {
    default: "Leenah Contribution Home | Secure Ajo & Group Savings App",
    template: "%s | LCH",
  },
  description:
    "Leenah Contribution Home helps members manage ajo groups, contribution plans, locked savings, wallets, and transparent transaction records in one secure fintech workspace.",
  keywords: [
    "Leenah Contribution Home",
    "LCH",
    "ajo savings app",
    "group savings",
    "community contributions",
    "contribution plans",
    "locked savings",
    "fintech Nigeria",
    "wallet savings",
  ],
  authors: [{ name: "Leenah Team" }],
  creator: "Leenah Contribution Home",
  publisher: "Leenah Contribution Home",
  category: "finance",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
      { url: "/site-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    title: "Leenah Contribution Home | Secure Ajo & Group Savings App",
    description:
      "Manage ajo groups, contribution plans, locked savings, wallets, and transparent transaction records with LCH.",
    siteName: "Leenah Contribution Home",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Leenah Contribution Home secure fintech dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leenah Contribution Home | Secure Ajo & Group Savings App",
    description:
      "The modern way to manage ajo groups, contribution plans, and locked savings.",
    images: ["/opengraph-image"],
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
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <main>{children}</main>
            </AuthProvider>
          </QueryProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
