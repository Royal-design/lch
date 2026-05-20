import { Plus } from "lucide-react"

import { AjoTypeMarketplace } from "@/components/ajo-type-marketplace"
import { ContributionHistory } from "@/components/contribution-history"
import { ContributionLeaderboard } from "@/components/contribution-leaderboard"
import { ContributionPlanList } from "@/components/contribution-plan-list"
import { AddContributionForm } from "@/components/forms/add-contribution-form"
import { CreateContributionPlanForm } from "@/components/forms/create-contribution-plan-form"
import { FormModal } from "@/components/forms/form-system"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
            description="Set up a personal savings plan. Group Ajo plans are joined from the marketplace."
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

          <ContributionPlanList />
        </section>

        <section className="space-y-5">
          <ContributionLeaderboard />
          <ContributionHistory />

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
