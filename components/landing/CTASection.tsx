import { Button } from "@/components/ui/button"
import { ShieldCheck, Zap, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import MaxWidthWrapper from "./MaxWidthWrapper"

export default function CTASection() {
  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <MaxWidthWrapper>
        <div className="relative rounded-[2rem] bg-slate-900 px-6 py-20 text-center shadow-2xl shadow-emerald-900/40 sm:px-12 sm:py-32 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-[100px]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl max-w-2xl leading-tight">
              Start Saving <span className="text-emerald-400">Smarter Today</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg text-slate-400">
              Join thousands of users growing their savings with Leenah. Secure, fast, and reliable collective finance at your fingertips.
            </p>

            <div className="mt-10 mb-12">
               <Button asChild size="lg" className="h-16 rounded-full bg-emerald-500 px-10 text-xl font-bold shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-95 group">
                <Link href="/register" className="flex items-center gap-3">
                  Get Started Now <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-slate-300">
              {[
                { icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />, text: "Secure" },
                { icon: <Zap className="h-5 w-5 text-emerald-400" />, text: "Fast" },
                { icon: <TrendingUp className="h-5 w-5 text-emerald-400" />, text: "Reliable" },
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {badge.icon}
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
