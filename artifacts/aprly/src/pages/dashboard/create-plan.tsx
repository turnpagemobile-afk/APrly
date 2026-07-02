import { useCallback, useEffect, useMemo, useRef } from "react";
import { readCreatePlanReturnTo } from "@/lib/create-plan-navigation";
import { useLocation } from "wouter";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CabinetPageLoader } from "@/components/dashboard/CabinetPageLoader";
import type { DashboardTab } from "@/components/dashboard/DashboardTabBar";
import { useDashboardSubscription } from "@/lib/use-dashboard-subscription";
import { useCreatePlanViaPlaid } from "@/lib/use-create-plan-via-plaid";
import { dashboardTabPath, parseDashboardTab } from "@/lib/dashboard-tab-url";

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
  const subscription = useDashboardSubscription(null);
  const plaidAutoStartRef = useRef(false);

  const returnTo = useMemo(
    () =>
      readCreatePlanReturnTo(
        typeof window !== "undefined" ? window.location.search : "",
      ),
    [],
  );

  const activeTab = useMemo(() => activeTabFromReturnTo(returnTo), [returnTo]);

  const onPlaidCancel = useCallback(() => {
    navigate(returnTo);
  }, [navigate, returnTo]);

  const { startCreatePlan, isCreatingPlan, loaderLabel } = useCreatePlanViaPlaid({
    returnTo,
    onPlaidCancel,
  });

  const onTabChange = useCallback(
    (tab: DashboardTab) => {
      navigate(dashboardTabPath(tab));
    },
    [navigate],
  );

  useEffect(() => {
    if (plaidAutoStartRef.current) return;
    if (subscription.isSubscriptionLoading) return;
    plaidAutoStartRef.current = true;
    startCreatePlan();
  }, [subscription.isSubscriptionLoading, startCreatePlan]);

  if (subscription.isSubscriptionLoading || isCreatingPlan) {
    return (
      <CabinetPageLoader
        label={subscription.isSubscriptionLoading ? "Loading…" : loaderLabel}
      />
    );
  }

  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={onTabChange}
      subscriptionActive={subscription.subscriptionActive}
      startCheckout={subscription.startCheckout}
      isCheckoutLoading={subscription.isCheckoutLoading}
      onCreateSavingPlan={startCreatePlan}
      isCreatingPlan={isCreatingPlan}
    >
      <CabinetPageLoader label={loaderLabel} />
    </DashboardShell>
  );
}
