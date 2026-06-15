import type { ReactNode } from "react";
import { Link } from "wouter";
import { AuthBrandLogo } from "@/components/auth/AuthBrandLogo";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { CabinetAppBanner } from "@/components/dashboard/CabinetAppBanner";
import { CabinetHeaderActions } from "@/components/dashboard/CabinetHeaderActions";
import { DashboardTabBar, type DashboardTab } from "@/components/dashboard/DashboardTabBar";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { footerContent, brandContent } from "@/content/landing";
import { createPlanHref } from "@/lib/create-plan-navigation";
import { DEFAULT_AUDIT_CHECKOUT_RETURN } from "@/lib/audit-checkout-return";
import { CabinetActivateProvider } from "@/lib/cabinet-activate-context";
import { dashboardTabPath } from "@/lib/dashboard-tab-url";
import type { StartCheckoutOptions } from "@/lib/use-audit-checkout";
import { CabinetPwaProvider, useCabinetPwaContext } from "@/lib/pwa/cabinet-pwa-context";
import { CabinetOfflineBanner } from "@/components/dashboard/CabinetOfflineBanner";
import { CabinetUpdateBanner } from "@/components/dashboard/CabinetUpdateBanner";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  showTabs?: boolean;
  subscriptionActive: boolean;
  startCheckout: (options?: StartCheckoutOptions) => void | Promise<void>;
  isCheckoutLoading?: boolean;
  activateReturnPath?: string;
  children: ReactNode;
};

function DashboardShellInner({
  activeTab,
  onTabChange,
  showTabs = true,
  subscriptionActive,
  startCheckout,
  isCheckoutLoading = false,
  activateReturnPath = DEFAULT_AUDIT_CHECKOUT_RETURN,
  children,
}: DashboardShellProps) {
  const { isOffline, updateAvailable } = useCabinetPwaContext();

  const copyright = footerContent.copyrightTemplate.replace(
    "{year}",
    String(new Date().getFullYear()),
  );

  const createPlanTarget = createPlanHref(dashboardTabPath(activeTab));

  const headerActionsProps = {
    isOffline,
    createPlanTarget,
  };

  return (
    <CabinetActivateProvider
      startCheckout={startCheckout}
      isCheckoutLoading={isCheckoutLoading}
      defaultReturnPath={activateReturnPath}
    >
      <div className="flex min-h-[100dvh] w-full flex-col bg-[#F8FCFE] text-[#202226]">
        <CabinetUpdateBanner visible={updateAvailable} />
        <CabinetOfflineBanner visible={isOffline} />
        <CabinetAppBanner subscriptionActive={subscriptionActive} />

        <header
          className={cn(
            "sticky top-0 z-50 w-full bg-[#F8FCFE]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F8FCFE]/90",
            showTabs ? "border-b-0 bp1200:border-b bp1200:border-[#D8DEE4]" : "border-b border-[#D8DEE4]",
          )}
        >
          <div
            className={cn(
              "w-full px-4 bp600:px-6 bp1200:px-8",
              showTabs ? "pt-3 pb-0 bp600:pt-4 bp1200:py-4" : "py-3 bp600:py-4",
            )}
          >
            <div
              className={cn(
                "hidden w-full items-center gap-3 bp1200:grid",
                showTabs ? "grid-cols-[1fr_auto_1fr]" : "grid-cols-[1fr_auto]",
              )}
            >
              <Link href="/dashboard?tab=home" className="justify-self-start" aria-label={`${brandContent.name} home`}>
                <AuthBrandLogo size="header" className="!text-left" />
              </Link>

              {showTabs ? (
                <DashboardTabBar
                  activeTab={activeTab}
                  onTabChange={onTabChange}
                  layout="center"
                  className="justify-self-center"
                />
              ) : (
                <div aria-hidden />
              )}

              <div className="flex items-center justify-end gap-2 justify-self-end">
                <CabinetHeaderActions variant="desktop" {...headerActionsProps} />
                <DashboardUserMenu />
              </div>
            </div>

            <div className="bp1200:hidden">
              <div className="flex items-center justify-between gap-3">
                <Link href="/dashboard?tab=home" aria-label={`${brandContent.name} home`}>
                  <AuthBrandLogo size="header" className="!text-left" />
                </Link>

                <div className="flex items-center justify-end gap-2">
                  <CabinetHeaderActions variant="compact" {...headerActionsProps} />
                  <DashboardUserMenu />
                </div>
              </div>

              {showTabs ? (
                <div className="-mx-4 mt-3 border-t border-[#D8DEE4]/80 bp600:-mx-6">
                  <DashboardTabBar activeTab={activeTab} onTabChange={onTabChange} layout="split" />
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">{children}</main>

        <LandingFooter copyright={copyright} homeHref="/dashboard?tab=home" />
      </div>
    </CabinetActivateProvider>
  );
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <CabinetPwaProvider>
      <DashboardShellInner {...props} />
    </CabinetPwaProvider>
  );
}
