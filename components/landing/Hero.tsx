import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import MaxWidthWrapper from "./MaxWidthWrapper"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-emerald-50/50 dark:from-emerald-950/20 to-background pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Background Ornaments */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-100/40 dark:bg-emerald-900/20 blur-3xl" />
      <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-blue-100/30 dark:bg-blue-900/10 blur-3xl" />

      <MaxWidthWrapper className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Text Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-6 flex items-center gap-2 rounded-full bg-emerald-100/50 dark:bg-emerald-950/50 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Trusted by 10k+ savers
            </div>

            <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Save Together. <br />
              <span className="text-emerald-600 dark:text-emerald-500">Grow Together.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
              Join contribution groups, save consistently, and build financial discipline with ease. Leenah helps you achieve your goals through community-driven savings.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="h-14 rounded-full bg-emerald-600 px-8 text-lg font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all hover:bg-emerald-700 hover:shadow-xl active:scale-95">
                <Link href="/register" className="flex items-center gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 rounded-full border-2 border-emerald-100 dark:border-emerald-900 px-8 text-lg font-semibold hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all">
                <Link href="#how-it-works" className="text-slate-700 dark:text-slate-300">Learn More</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
              {[
                "Secure",
                "Trusted",
                "Easy to Use",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Illustration Section */}
          <div className="relative group lg:ml-auto">
            <div className="absolute -inset-4 rounded-3xl bg-linear-to-tr from-emerald-100 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 opacity-50 blur-2xl transition-opacity group-hover:opacity-70" />
            <div className="relative flex h-[400px] w-full max-w-[500px] items-center justify-center overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 shadow-2xl backdrop-blur-sm sm:h-[500px]">
              {/* This is where the generated image will go */}
              <div className="flex flex-col items-center gap-6 p-8 text-center animate-in fade-in duration-1000">
                <div className="relative h-48 w-48 rounded-full bg-emerald-50 shadow-inner sm:h-64 sm:w-64">
                   {/* Fallback pattern if image is not ready */}
                   <svg
                    className="absolute inset-0 h-full w-full p-12 text-emerald-200 animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                   <div className="absolute -right-4 top-8 flex h-14 w-14 animate-bounce items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-emerald-50 dark:ring-emerald-900/50">
                    💰
                  </div>
                  <div className="absolute -left-2 bottom-12 flex h-12 w-12 animate-bounce items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-blue-50 dark:ring-blue-900/50 delay-700">
                    📈
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-foreground">Your Savings are Growing</p>
                  <p className="text-sm text-muted-foreground">Join the community of smart savers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
