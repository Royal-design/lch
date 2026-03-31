import { Geist_Mono, Inter } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import "./globals.css"

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
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
