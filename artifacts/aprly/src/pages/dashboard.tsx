import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardTab } from "@/components/dashboard/DashboardTabBar";
import { DashboardHomeTab } from "@/components/dashboard/home/DashboardHomeTab";
import { DashboardDetailTab } from "@/components/dashboard/DashboardDetailTab";
import { useDashboardSubscription } from "@/lib/use-dashboard-subscription";
import { toast } from "@/hooks/use-toast";
import { dashboardTabContent } from "@/content/dashboard-tab";

function parseTab(search: string): DashboardTab {
  const params = new URLSearchParams(search);
  return params.get("tab") === "dashboard" ? "dashboard" : "home";
}

function readTabFromUrl(): DashboardTab {
  if (typeof window === "undefined") return "home";
  return parseTab(window.location.search);
}

function readStripeSessionFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get("tab") !== "dashboard") return null;
  return params.get("stripe_session");
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<DashboardTab>(readTabFromUrl);
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(readStripeSessionFromUrl);

  const subscription = useDashboardSubscription(stripeSessionId);

  useEffect(() => {
    const onPopState = () => setActiveTab(readTabFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("stripe_session");
    const cancelled = params.get("stripe_cancel");
    const tab = params.get("tab");

    if (sid && tab === "dashboard") {
      setStripeSessionId(sid);
      setActiveTab("dashboard");
      const clean = `${window.location.pathname}?tab=dashboard`;
      window.history.replaceState({}, "", clean);
    }

    if (cancelled && tab === "dashboard") {
      toast({
        title: dashboardTabContent.checkout.cancelTitle,
        description: dashboardTabContent.checkout.cancelDescription,
      });
      const clean = `${window.location.pathname}?tab=dashboard`;
      window.history.replaceState({}, "", clean);
    }
  }, []);

  useEffect(() => {
    if (!subscription.isPollingReturn && stripeSessionId) {
      const paid =
        subscription.tabQuery.data?.subscriptionActive &&
        !subscription.isSubscriptionLoading;
      if (paid) setStripeSessionId(null);
    }
  }, [
    subscription.isPollingReturn,
    subscription.isSubscriptionLoading,
    subscription.tabQuery.data?.subscriptionActive,
    stripeSessionId,
  ]);

  const setTab = useCallback(
    (tab: DashboardTab) => {
      setActiveTab(tab);
      setLocation(tab === "dashboard" ? "/dashboard?tab=dashboard" : "/dashboard");
    },
    [setLocation],
  );

  if (subscription.isSubscriptionLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  if (subscription.isSubscriptionError && !subscription.tabQuery.data) {
    return (
      <div className="app-page-cabinet py-16 text-center">
        <p className="text-destructive">Could not verify your subscription status.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check that the API is running, then try again.
        </p>
        <button
          type="button"
          className="mt-6 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          onClick={() => void subscription.tabQuery.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={setTab}
      subscriptionActive={subscription.subscriptionActive}
      onActivateSubscription={() => void subscription.startCheckout()}
      isCheckoutLoading={subscription.isCheckoutLoading}
    >
      {activeTab === "dashboard" ? (
        <DashboardDetailTab
          subscriptionActive={subscription.subscriptionActive}
          hasLeads={subscription.hasLeads}
          plans={subscription.plans}
          summary={subscription.summary}
          isSubscriptionError={subscription.isSubscriptionError}
          onActivateSubscription={() => void subscription.startCheckout()}
          isCheckoutLoading={subscription.isCheckoutLoading}
          isPollingReturn={subscription.isPollingReturn}
        />
      ) : (
        <DashboardHomeTab
          subscriptionActive={subscription.subscriptionActive}
          onGoToDashboard={() => setTab("dashboard")}
        />
      )}
    </DashboardShell>
  );
}
