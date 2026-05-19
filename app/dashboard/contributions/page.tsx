import { CalendarClock, LockKeyhole, Plus, Trophy, TrendingUp } from "lucide-react"

import { AjoTypeMarketplace } from "@/components/ajo-type-marketplace"
import { AddContributionForm } from "@/components/forms/add-contribution-form"
import { CreateContributionPlanForm } from "@/components/forms/create-contribution-plan-form"
import { FormModal } from "@/components/forms/form-system"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const plans = [
  ["Family Ajo Circle", "NGN 420,000", "NGN 600,000", "70%", "Owner controlled"],
  ["Rent Savings", "NGN 275,000", "NGN 800,000", "34%", "Maturity only"],
  ["Business Capital", "NGN 150,000", "NGN 500,000", "30%", "Anytime access"],
]

const leaderboard = [
  ["Amina Yusuf", "NGN 120,000", "100%", "1"],
  ["Tunde Bello", "NGN 95,000", "92%", "2"],
  ["Leenah Admin", "NGN 82,500", "88%", "3"],
]

export default function ContributionsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Contribution plans
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Savings goals
          </h1>
        </div>
        <div className="flex gap-2">
          <FormModal
            title="Create contribution plan"
            description="Set up an Ajo or personal plan with owner-defined withdrawal rules."
            trigger={
              <Button className="h-10 rounded-xl sm:w-auto">
                <Plus className="size-4" />
                New plan
              </Button>
            }
          >
            <CreateContributionPlanForm framed={false} />
          </FormModal>
          <FormModal
            title="Add contribution"
            description="Record a contribution into one of your active plans."
            trigger={
              <Button variant="outline" className="h-10 rounded-xl sm:w-auto">
                Add funds
              </Button>
            }
          >
            <AddContributionForm framed={false} />
          </FormModal>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Join an Ajo</h2>
            <div className="mt-3">
              <AjoTypeMarketplace />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {plans.map(([title, saved, target, progress, duration]) => (
              <Card key={title} className="fintech-surface fintech-card-hover rounded-[1.35rem]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-3">
                    <span>{title}</span>
                    <span className="grid size-10 place-items-center rounded-2xl bg-accent text-primary">
                      <LockKeyhole className="size-4" />
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between text-sm">
                    <p className="text-xl font-bold">{saved}</p>
                    <p className="text-muted-foreground">{target}</p>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: progress }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="size-3.5" />
                      {duration}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-primary">
                      <TrendingUp className="size-3.5" />
                      {progress}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <Card className="fintech-surface rounded-[1.35rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-4 text-primary" />
                Ajo leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.map(([name, amount, score, rank]) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl bg-accent text-sm font-bold text-primary">
                      {rank}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        Contribution score {score}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold">{amount}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="fintech-surface rounded-[1.35rem]">
            <CardContent className="p-5">
              <p className="text-sm font-bold">Owner rules</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Each Ajo can allow anytime withdrawals, maturity-only payouts,
                or owner-controlled approvals. The setup lives in the create
                plan modal to keep the workspace clean.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
