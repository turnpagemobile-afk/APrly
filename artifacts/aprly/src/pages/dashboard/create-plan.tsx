import { useCallback, useMemo, useState } from "react";
import { readCreatePlanReturnTo } from "@/lib/create-plan-navigation";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  getGetDashboardTabQueryKey,
  useCreateDetailedPlan,
} from "@workspace/api-client-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardTab } from "@/components/dashboard/DashboardTabBar";
import { CreateSavingPlanCardList } from "@/components/dashboard/create-plan/CreateSavingPlanCardList";
import { mapCardEntriesToImportItems } from "@/components/cards/mapCardEntries";
import { usePlaidCardImport } from "@/components/cards/usePlaidCardImport";
import type { CardEntry } from "@/components/landing/types";
import { createPlanContent } from "@/content/create-plan";
import { dashboardPromoContent } from "@/content/dashboard-home";
import { useDashboardSubscription } from "@/lib/use-dashboard-subscription";
import { requireOnlineForCabinetAction } from "@/lib/pwa/use-cabinet-pwa";
import { createPlanCardsAreComplete } from "@/lib/create-plan-cards";
import { dashboardTabPath, parseDashboardTab } from "@/lib/dashboard-tab-url";
import { toast } from "@/hooks/use-toast";

function activeTabFromReturnTo(returnTo: string): DashboardTab {
  try {
    const query = returnTo.includes("?") ? returnTo.slice(returnTo.indexOf("?")) : "";
    return parseDashboardTab(query || "?tab=dashboard");
  } catch {
    return "dashboard";
  }
}

export default function CreateDetailedPlanPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const subscription = useDashboardSubscription(null);
  const createPlan = useCreateDetailedPlan();

  const [accounts, setAccounts] = useState<CardEntry[]>([]);
  const { startPlaid, plaidBusy } = usePlaidCardImport(setAccounts);

  const cardsReady = useMemo(() => createPlanCardsAreComplete(accounts), [accounts]);

  const returnTo = useMemo(
    () =>
      readCreatePlanReturnTo(
        typeof window !== "undefined" ? window.location.search : "",
      ),
    [],
  );

  const activeTab = useMemo(() => activeTabFromReturnTo(returnTo), [returnTo]);

  const onTabChange = useCallback(
    (tab: DashboardTab) => {
      navigate(dashboardTabPath(tab));
    },
    [navigate],
  );

  const addManualCard = () => {
    setAccounts((prev) => [...prev, { brand: "", balance: "", rate: "" }]);
  };

  const onPlaid = () => {
    if (!requireOnlineForCabinetAction()) {
      toast({
        title: dashboardPromoContent.offlineBanner,
        variant: "destructive",
      });
      return;
    }
    void startPlaid();
  };

  const onSavePlan = async () => {
    if (!cardsReady) return;
    if (!requireOnlineForCabinetAction()) {
      toast({
        title: dashboardPromoContent.offlineBanner,
        variant: "destructive",
      });
      return;
    }
    const cards = mapCardEntriesToImportItems(accounts);
    if (!cards.length) return;

    try {
      await createPlan.mutateAsync({ data: { cards } });
      await queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
      toast({
        title: createPlanContent.successTitle,
        description: createPlanContent.successDescription,
      });
      navigate("/dashboard?tab=dashboard");
    } catch {
      toast({
        title: createPlanContent.errorTitle,
        description: createPlanContent.errorDescription,
        variant: "destructive",
      });
    }
  };

  if (subscription.isSubscriptionLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={onTabChange}
      subscriptionActive={subscription.subscriptionActive}
      startCheckout={subscription.startCheckout}
      isCheckoutLoading={subscription.isCheckoutLoading}
    >
      <div className="app-page-cabinet max-w-none py-6 cabinet:max-w-none bp600:py-8">
        <div className="dash-create-plan-layout dash-create-plan-stack">
          <h1 className="dash-create-plan-page-title">{createPlanContent.title}</h1>

          <CreateSavingPlanCardList accounts={accounts} setAccounts={setAccounts} />

          <div className="dash-create-plan-add-section">
            <button
              type="button"
              className="dash-create-plan-plaid-btn"
              disabled={plaidBusy}
              onClick={onPlaid}
            >
              {plaidBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {createPlanContent.plaidCta}
            </button>

            <p className="dash-create-plan-manual-row">
              <span>{createPlanContent.manualHint}</span>
              <button
                type="button"
                className="dash-create-plan-manual-link"
                onClick={addManualCard}
              >
                {createPlanContent.manualAdd}
              </button>
            </p>
          </div>

          <div className="dash-create-plan-save-row">
            <button
              type="button"
              className="dash-create-plan-save-btn"
              disabled={!cardsReady || createPlan.isPending}
              onClick={() => void onSavePlan()}
            >
              {createPlan.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {createPlanContent.savePlan}
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
