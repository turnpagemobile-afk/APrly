import { Loader2 } from "lucide-react";
import type {
  DashboardPlansSummary as DashboardPlansSummaryData,
  PlanLead,
} from "@workspace/api-client-react";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { SubscriptionStatusCard } from "@/components/dashboard/SubscriptionStatusCard";
import { CreatePlanEmptyCard } from "@/components/dashboard/CreatePlanEmptyCard";
import { DashboardPlansSummary } from "@/components/dashboard/DashboardPlansSummary";
import { PlanLeadCard } from "@/components/dashboard/PlanLeadCard";
import { PillButton } from "@/components/shared/PillButton";

type DashboardDetailTabProps = {
  subscriptionActive: boolean;
  hasLeads: boolean;
  plans: PlanLead[];
  summary: DashboardPlansSummaryData | undefined;
  isSubscriptionError?: boolean;
  isPollingReturn?: boolean;
  onCreateSavingPlan: () => void;
  isCreatingPlan?: boolean;
};

export function DashboardDetailTab({
  subscriptionActive,
  hasLeads,
  plans,
  summary,
  isSubscriptionError = false,
  isPollingReturn = false,
  onCreateSavingPlan,
  isCreatingPlan = false,
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

  const visiblePlans = plans.filter((p) => p.status !== "denied");

  return (
    <div className="app-page-cabinet max-w-none py-6 cabinet:max-w-none bp600:py-8">
      <div className="dash-plans-layout space-y-8">
        <h1 className="app-header-screen-title-bold text-average">
          {dashboardTabContent.pageTitle}
        </h1>

        {!hasLeads ? (
          <>
            <SubscriptionStatusCard active={subscriptionActive} />
            <CreatePlanEmptyCard
              onCreateSavingPlan={onCreateSavingPlan}
              isCreatingPlan={isCreatingPlan}
            />
          </>
        ) : (
          <>
            {summary ? (
              <DashboardPlansSummary
                subscriptionActive={subscriptionActive}
                summary={summary}
              />
            ) : null}

            <ul className="w-full space-y-4">
              {visiblePlans.map((plan, index) => (
                <li key={plan.id} className="w-full">
                  <PlanLeadCard
                    plan={plan}
                    planIndex={index + 1}
                    returnTo="/dashboard?tab=dashboard"
                  />
                </li>
              ))}
            </ul>

            <div className="flex justify-center">
              <PillButton
                type="button"
                variant="primary"
                size="xl"
                className="h-[76px] w-[329px] max-w-full app-button-button-xl"
                disabled={isCreatingPlan}
                onClick={onCreateSavingPlan}
              >
                {dashboardTabContent.planLeads.addLead}
              </PillButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
