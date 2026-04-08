import Link from "next/link"
import MaxWidthWrapper from "./MaxWidthWrapper"
import { MessageCircle, Send, Camera, Briefcase, Code } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 dark:border-slate-900 pt-20 pb-10 text-slate-400">
      <MaxWidthWrapper>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">Leenah</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Empowering communities through collective financial growth. Save together, grow together, and build a secure future.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: <MessageCircle className="h-5 w-5" />, href: "#" },
                { icon: <Send className="h-5 w-5" />, href: "#" },
                { icon: <Camera className="h-5 w-5" />, href: "#" },
                { icon: <Briefcase className="h-5 w-5" />, href: "#" },
                { icon: <Code className="h-5 w-5" />, href: "#" },
              ].map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className="transition-colors hover:text-emerald-400"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Company</h4>
            <div className="flex flex-col gap-3 text-sm">
              {["About Us", "Our Mission", "Careers", "Blog"].map((link) => (
                <Link key={link} href="#" className="transition-colors hover:text-white">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Support</h4>
            <div className="flex flex-col gap-3 text-sm">
              {["Help Center", "Safety", "Contact Us", "FAQ"].map((link) => (
                <Link key={link} href="#" className="transition-colors hover:text-white">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-6">
             <h4 className="text-sm font-bold uppercase tracking-wider text-white">Legal</h4>
            <div className="flex flex-col gap-3 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "Compliance"].map((link) => (
                <Link key={link} href="#" className="transition-colors hover:text-white">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-slate-800 dark:border-slate-900 pt-8 sm:flex-row">
          <p className="text-sm">
            © {new RegExp(/\d{4}/).exec(new Date().toISOString())} Leenah Contribution Home. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
             <Link href="#" className="transition-colors hover:text-white">Privacy</Link>
             <Link href="#" className="transition-colors hover:text-white">Terms</Link>
             <Link href="#" className="transition-colors hover:text-white">Cookies</Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  )
}
