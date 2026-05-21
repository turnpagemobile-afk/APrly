import type { ReactNode } from "react";
import { Link } from "wouter";
import { brandContent } from "@/content/landing";
import { Button } from "@/components/ui/button";
import { DashboardTabBar, type DashboardTab } from "@/components/dashboard/DashboardTabBar";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { createPlanHref } from "@/lib/create-plan-navigation";
import { dashboardTabPath } from "@/lib/dashboard-tab-url";
import { CabinetPwaProvider, useCabinetPwaContext } from "@/lib/pwa/cabinet-pwa-context";
import { CabinetOfflineBanner } from "@/components/dashboard/CabinetOfflineBanner";
import { CabinetUpdateBanner } from "@/components/dashboard/CabinetUpdateBanner";

type DashboardShellProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  showTabs?: boolean;
  subscriptionActive: boolean;
  onActivateSubscription: () => void;
  isCheckoutLoading?: boolean;
  children: ReactNode;
};

function DashboardShellInner({
  activeTab,
  onTabChange,
  showTabs = true,
  subscriptionActive,
  onActivateSubscription,
  isCheckoutLoading = false,
  children,
}: DashboardShellProps) {
  const { isOffline, updateAvailable } = useCabinetPwaContext();

  return (
    <div className="flex w-full flex-col bg-background text-foreground">
      <CabinetUpdateBanner visible={updateAvailable} />
      <CabinetOfflineBanner visible={isOffline} />
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="app-page-cabinet flex h-14 items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="text-2xl font-black tracking-tight text-foreground"
            aria-label={brandContent.name}
          >
            {brandContent.name}
          </Link>

          <div className="flex items-center gap-2">
            {subscriptionActive ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="font-semibold"
                  asChild
                >
                  <Link href={createPlanHref(dashboardTabPath(activeTab))}>
                    <span className="hidden cabinet:inline">Add bank account</span>
                    <span className="cabinet:hidden">Add bank</span>
                  </Link>
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="sm"
                className="font-semibold"
                onClick={onActivateSubscription}
                disabled={isCheckoutLoading}
              >
                Activate APRly
              </Button>
            )}
            <DashboardUserMenu />
          </div>
        </div>

        {showTabs ? (
          <div className="app-page-cabinet">
            <DashboardTabBar activeTab={activeTab} onTabChange={onTabChange} />
          </div>
        ) : null}
      </header>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <CabinetPwaProvider>
      <DashboardShellInner {...props} />
    </CabinetPwaProvider>
  );
}
