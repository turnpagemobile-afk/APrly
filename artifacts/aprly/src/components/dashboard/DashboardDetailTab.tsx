import { Link } from "wouter";
import { Loader2, Plus } from "lucide-react";
import type {
  DashboardPlansSummary as DashboardPlansSummaryData,
  PlanLead,
} from "@workspace/api-client-react";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { SubscriptionStatusCard } from "@/components/dashboard/SubscriptionStatusCard";
import { SubscriptionUpsellCard } from "@/components/dashboard/SubscriptionUpsellCard";
import { CreatePlanEmptyCard } from "@/components/dashboard/CreatePlanEmptyCard";
import { DashboardPlansSummary } from "@/components/dashboard/DashboardPlansSummary";
import { PlanLeadCard } from "@/components/dashboard/PlanLeadCard";
import { Button } from "@/components/ui/button";
import { createPlanHref } from "@/lib/create-plan-navigation";

type DashboardDetailTabProps = {
  subscriptionActive: boolean;
  hasLeads: boolean;
  plans: PlanLead[];
  summary: DashboardPlansSummaryData | undefined;
  isSubscriptionError?: boolean;
  onActivateSubscription: () => void;
  isCheckoutLoading?: boolean;
  isPollingReturn?: boolean;
};

export function DashboardDetailTab({
  subscriptionActive,
  hasLeads,
  plans,
  summary,
  isSubscriptionError = false,
  onActivateSubscription,
  isCheckoutLoading = false,
  isPollingReturn = false,
}: DashboardDetailTabProps) {
  if (isPollingReturn) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  if (isSubscriptionError) {
    return (
      <div className="app-page-cabinet py-16 text-center">
        <p className="text-destructive">Could not load your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="app-page-cabinet space-y-6 py-8">
      <h1 className="text-2xl font-black tracking-tight text-foreground">Dashboard</h1>

      {subscriptionActive ? <SubscriptionStatusCard active /> : null}

      {!subscriptionActive && hasLeads ? (
        <SubscriptionUpsellCard
          onActivate={onActivateSubscription}
          isLoading={isCheckoutLoading}
        />
      ) : null}

      {!subscriptionActive && !hasLeads ? (
        <>
          <SubscriptionStatusCard active={false} />
          <SubscriptionUpsellCard
            onActivate={onActivateSubscription}
            isLoading={isCheckoutLoading}
          />
        </>
      ) : null}

      {!hasLeads ? <CreatePlanEmptyCard /> : null}

      {hasLeads && summary ? (
        <>
          <DashboardPlansSummary
            subscriptionActive={subscriptionActive}
            summary={summary}
          />

          <div className="flex items-center justify-between gap-3 pt-2">
            <h2 className="text-lg font-bold text-foreground">
              {dashboardTabContent.planLeads.title}
            </h2>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label={dashboardTabContent.planLeads.addAriaLabel}
              asChild
            >
              <Link href={createPlanHref("/dashboard?tab=dashboard")}>
                <Plus className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="space-y-4">
            {plans
              .filter((p) => p.status !== "denied")
              .map((plan) => (
                <li key={plan.id}>
                  <PlanLeadCard
                    plan={plan}
                    returnTo="/dashboard?tab=dashboard"
                  />
                </li>
              ))}
          </ul>

          <Button type="button" className="w-full font-semibold" asChild>
            <Link href={createPlanHref("/dashboard?tab=dashboard")}>
              {dashboardTabContent.planLeads.addLead}
            </Link>
          </Button>
        </>
      ) : null}
    </div>
  );
}
