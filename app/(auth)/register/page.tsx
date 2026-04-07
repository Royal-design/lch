import { RegisterForm } from "@/components/register-form"
import Link from "next/link"
import Image from "next/image"

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* LEFT COLUMN - RICH TEXTUAL DESIGN */}
      <div className="relative hidden flex-col bg-emerald-950 p-12 text-white lg:flex">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/auth-side.png"
            alt="Background"
            fill
            className="object-cover grayscale"
            priority
          />
        </div>
        
        <div className="relative z-10 flex items-center gap-2">
           <Link href="/" className="flex items-center gap-2 group">
             <span className="text-3xl font-bold tracking-tight text-emerald-400 transition-colors group-hover:text-emerald-300">
               Leenah
             </span>
          </Link>
        </div>

        <div className="relative z-10 mt-20 flex flex-col gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
              Start your <span className="text-emerald-400">collective growth</span> journey today.
            </h1>
            <p className="text-xl text-emerald-100/80 max-w-lg">
              Join thousands of users building wealth through transparent, community-led savings.
            </p>
          </div>

          <div className="mt-12 grid gap-8">
            {[
              {
                title: "Flexible Contribution",
                desc: "Choose amount and frequency that fits your lifestyle.",
              },
              {
                title: "Trusted Network",
                desc: "Verified members and secure group management.",
              },
              {
                title: "Financial Wellness",
                desc: "Gain discipline and reach your goals faster together.",
              },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col gap-1 border-l-2 border-emerald-500/30 pl-4 transition-colors hover:border-emerald-400">
                <h3 className="text-lg font-bold text-emerald-400">{feature.title}</h3>
                <p className="text-sm text-emerald-100/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-10 border-t border-white/10">
          <p className="text-sm text-emerald-100/40">
            © 2026 Leenah Contribution Home. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN - REGISTER FORM */}
      <div className="flex flex-col items-center justify-center p-6 md:p-10">
        <div className="flex w-full max-w-lg flex-col gap-6">
           {/* Mobile Logo */}
           <Link href="/" className="flex items-center gap-2 self-center lg:hidden group">
             <span className="text-3xl font-bold tracking-tight text-emerald-600 transition-colors group-hover:text-emerald-700">
               LCH
             </span>
          </Link>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
