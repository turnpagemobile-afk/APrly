import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CabinetPageLoader } from "@/components/dashboard/CabinetPageLoader";
import type { DashboardTab } from "@/components/dashboard/DashboardTabBar";
import { DashboardHomeTab } from "@/components/dashboard/home/DashboardHomeTab";
import { DashboardDetailTab } from "@/components/dashboard/DashboardDetailTab";
import { DashboardTabErrorBoundary } from "@/components/dashboard/DashboardTabErrorBoundary";
import { useDashboardSubscription } from "@/lib/use-dashboard-subscription";
import { toast } from "@/hooks/use-toast";
import { dashboardTabContent } from "@/content/dashboard-tab";
import {
  dashboardTabPath,
  parseDashboardTab,
} from "@/lib/dashboard-tab-url";

function readTabFromUrl(): DashboardTab {
  if (typeof window === "undefined") return "home";
  return parseDashboardTab(window.location.search);
}

function readAuditSessionFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get("tab") !== "dashboard") return null;
  return params.get("audit_session");
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<DashboardTab>(readTabFromUrl);
  const [auditSessionId, setAuditSessionId] = useState<string | null>(readAuditSessionFromUrl);

  const subscription = useDashboardSubscription(auditSessionId);

  useEffect(() => {
    const onPopState = () => setActiveTab(readTabFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tab = readTabFromUrl();
    const expected = dashboardTabPath(tab);
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== expected) {
      window.history.replaceState({}, "", expected);
    }
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const auditSid = params.get("audit_session");
    const cancelled = params.get("audit_cancel");
    const tab = params.get("tab");

    if (auditSid && tab === "dashboard") {
      setAuditSessionId(auditSid);
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
    if (auditSessionId && subscription.tabQuery.data?.subscriptionActive) {
      setAuditSessionId(null);
    }
  }, [auditSessionId, subscription.tabQuery.data?.subscriptionActive]);

  const setTab = useCallback(
    (tab: DashboardTab) => {
      setActiveTab(tab);
      setLocation(dashboardTabPath(tab));
    },
    [setLocation],
  );

  if (subscription.isSubscriptionLoading) {
    return <CabinetPageLoader />;
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
      <DashboardTabErrorBoundary>
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
      </DashboardTabErrorBoundary>
    </DashboardShell>
  );
}
