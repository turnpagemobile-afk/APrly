import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardTab } from "@/components/dashboard/DashboardTabBar";
import { AccountAccessCard } from "@/components/dashboard/account/AccountAccessCard";
import { AccountActionsRow } from "@/components/dashboard/account/AccountActionsRow";
import { AccountLoginEmailCard } from "@/components/dashboard/account/AccountLoginEmailCard";
import { AccountPasswordCard } from "@/components/dashboard/account/AccountPasswordCard";
import { AccountPersonalInfoCard } from "@/components/dashboard/account/AccountPersonalInfoCard";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { profileAuditCheckoutReturnPath } from "@/lib/audit-checkout-return";
import { useCabinetActivate } from "@/lib/cabinet-activate-context";
import { useAuth } from "@/lib/auth-session";
import { dashboardTabPath } from "@/lib/dashboard-tab-url";
import { toast } from "@/hooks/use-toast";
import { useAuditReturnUrl } from "@/lib/use-audit-return-url";
import { useDashboardSubscription } from "@/lib/use-dashboard-subscription";
import { useCreatePlanViaPlaid } from "@/lib/use-create-plan-via-plaid";

function ProfileAccountAccessCard({
  subscriptionActive,
  accessActivatedAt,
}: {
  subscriptionActive: boolean;
  accessActivatedAt?: string | null;
}) {
  const { openActivateModal, isCheckoutLoading } = useCabinetActivate();

  return (
    <AccountAccessCard
      subscriptionActive={subscriptionActive}
      accessActivatedAt={accessActivatedAt}
      onActivate={() => openActivateModal(profileAuditCheckoutReturnPath())}
      isCheckoutLoading={isCheckoutLoading}
    />
  );
}

export default function DashboardProfilePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const onCheckoutCancel = useCallback(() => {
    toast({
      title: dashboardTabContent.checkout.cancelTitle,
      description: dashboardTabContent.checkout.cancelDescription,
    });
  }, []);

  const { auditSessionId, clearAuditSession } = useAuditReturnUrl(onCheckoutCancel);
  const subscription = useDashboardSubscription(auditSessionId);
  const { startCreatePlan, isCreatingPlan } = useCreatePlanViaPlaid({
    returnTo: "/dashboard?tab=dashboard",
  });

  useEffect(() => {
    if (auditSessionId && subscription.subscriptionActive) {
      clearAuditSession();
    }
  }, [auditSessionId, subscription.subscriptionActive, clearAuditSession]);

  const onDashboardTabChange = useCallback(
    (tab: DashboardTab) => {
      setLocation(dashboardTabPath(tab));
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

  return (
    <DashboardShell
      activeTab="dashboard"
      onTabChange={onDashboardTabChange}
      subscriptionActive={subscription.subscriptionActive}
      startCheckout={subscription.startCheckout}
      isCheckoutLoading={subscription.isCheckoutLoading}
      activateReturnPath={profileAuditCheckoutReturnPath()}
      onCreateSavingPlan={startCreatePlan}
      isCreatingPlan={isCreatingPlan}
    >
      <div className="app-page-cabinet max-w-none py-6 cabinet:max-w-none bp600:py-8">
        <div className="dash-account-layout space-y-4 bp600:space-y-5">
          <h1 className="dash-account-page-title">{dashboardProfileContent.pageTitle}</h1>

          <ProfileAccountAccessCard
            subscriptionActive={subscription.subscriptionActive}
            accessActivatedAt={subscription.accessActivatedAt}
          />

          <AccountLoginEmailCard email={user?.email ?? ""} />

          <AccountPersonalInfoCard />

          <AccountPasswordCard />

          <AccountActionsRow />
        </div>
      </div>
    </DashboardShell>
  );
}
