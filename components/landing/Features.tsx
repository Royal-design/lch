import { Users, ShieldCheck, BarChart3, LayoutList } from "lucide-react"
import MaxWidthWrapper from "./MaxWidthWrapper"

const features = [
  {
    icon: <Users className="h-8 w-8 text-emerald-600" />,
    title: "Group Savings",
    description: "Join and save with others in verified contribution groups. Collective growth starts here.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-emerald-600" />,
    title: "Secure Payments",
    description: "Your transactions are protected by industry-standard encryption. Safe and reliable always.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-emerald-600" />,
    title: "Track Contributions",
    description: "Monitor your savings progress with intuitive dashboards and real-time alerts.",
  },
  {
    icon: <LayoutList className="h-8 w-8 text-emerald-600" />,
    title: "Flexible Plans",
    description: "Choose how you want to save. Daily, weekly, or monthly—it's entirely up to you.",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <MaxWidthWrapper>
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need for <span className="text-emerald-600">Smarter Savings</span>
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Our platform is designed to make group contributions seamless, secure, and rewarding.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col items-start p-8 rounded-3xl border border-border bg-card transition-all hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 transition-colors group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
