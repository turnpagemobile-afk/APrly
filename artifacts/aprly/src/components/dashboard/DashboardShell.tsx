import type { ReactNode } from "react";
import { Link } from "wouter";
import { brandContent } from "@/content/landing";
import { Button } from "@/components/ui/button";
import { DashboardTabBar, type DashboardTab } from "@/components/dashboard/DashboardTabBar";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { createPlanHref } from "@/lib/create-plan-navigation";

type DashboardShellProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  showTabs?: boolean;
  subscriptionActive: boolean;
  onActivateSubscription: () => void;
  isCheckoutLoading?: boolean;
  children: ReactNode;
};

export function DashboardShell({
  activeTab,
  onTabChange,
  showTabs = true,
  subscriptionActive,
  onActivateSubscription,
  isCheckoutLoading = false,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex w-full flex-col bg-background text-foreground">
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
                  <Link
                    href={createPlanHref(
                      activeTab === "dashboard"
                        ? "/dashboard?tab=dashboard"
                        : "/dashboard",
                    )}
                  >
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
