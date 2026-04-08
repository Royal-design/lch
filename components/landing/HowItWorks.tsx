import { UserPlus, Users, Wallet, Star } from "lucide-react"
import MaxWidthWrapper from "./MaxWidthWrapper"

const steps = [
  {
    number: "01",
    title: "Create an account",
    description: "Sign up in minutes with your basic details. It's fast, free, and secure.",
    icon: <UserPlus className="h-6 w-6 text-emerald-600" />,
  },
  {
    number: "02",
    title: "Join a contribution group",
    description: "Browse verified groups or create your own with friends and family.",
    icon: <Users className="h-6 w-6 text-emerald-600" />,
  },
  {
    number: "03",
    title: "Make regular contributions",
    description: "Set your preferred schedule and contribute consistently to the group pool.",
    icon: <Wallet className="h-6 w-6 text-emerald-600" />,
  },
  {
    number: "04",
    title: "Withdraw and enjoy",
    description: "Receive your lump sum payout when it's your turn. Spend or reinvest!",
    icon: <Star className="h-6 w-6 text-emerald-600" />,
  },
]

// Note: Users icon is imported from lucide-react at the top

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/50">
      <MaxWidthWrapper>
        <div className="flex flex-col items-center text-center space-y-4 mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Success in <span className="text-emerald-600 dark:text-emerald-500">4 Simple Steps</span>
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Getting started with LCH is easy. Follow these steps to begin your journey towards collective financial growth.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 md:grid-cols-2 relative lg:gap-8">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-emerald-100/60 dark:bg-emerald-900/30 hidden lg:block -translate-y-1/2 scale-x-[0.85] pointer-events-none" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center group">
              <div className="mb-8 relative flex h-20 w-20 items-center justify-center rounded-3xl bg-card border border-border dark:border-emerald-900/50 shadow-xl shadow-emerald-500/5 transition-transform group-hover:scale-110 z-10">
                <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50">
                  {step.number}
                </div>
                {step.icon}
              </div>
              
              <h3 className="mb-4 text-xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed px-4">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
