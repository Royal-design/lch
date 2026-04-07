import { Star } from "lucide-react"
import Image from "next/image"
import MaxWidthWrapper from "./MaxWidthWrapper"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Regular Saver",
    review: "Leenah helped me stay consistent with my savings! I&apos;ve been able to hit my targets every single month since I joined my first group.",
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    name: "Michael Chen",
    role: "Community Leader",
    review: "Very easy to use and reliable platform. The transparency in tracking contributions is exactly what we needed for our family group.",
    avatar: "https://i.pravatar.cc/150?u=michael",
  },
  {
    name: "Amara Okeke",
    role: "Entrepreneur",
    review: "I love the group contribution feature. It&apos;s like a digital Esusu/Ajo but safer and way more organized. 10/10 recommendation!",
    avatar: "https://i.pravatar.cc/150?u=amara",
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white relative">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-50/40 blur-3xl" />

      <MaxWidthWrapper className="relative">
        <div className="flex flex-col items-center text-center space-y-4 mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Loved by <span className="text-emerald-600">Our Community</span>
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Don&apos;t just take our word for it. Here&apos;s what our savers have to say about their experience with Leenah Contribution Home.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col p-8 rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-100/50 transition-all hover:border-emerald-100 hover:shadow-emerald-200/20"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                ))}
              </div>
              <p className="flex-1 text-lg italic text-slate-800 leading-relaxed mb-8">
                &quot;{t.review}&quot;
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full border-2 border-white shadow-md ring-2 ring-emerald-50"
                />
                <div>
                  <h4 className="font-bold text-slate-900 leading-none">{t.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
