import type { ReactNode } from "react";
import { CabinetAppBanner } from "@/components/dashboard/CabinetAppBanner";
import { CabinetHeader } from "@/components/dashboard/CabinetHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { footerContent } from "@/content/landing";
import { DEFAULT_AUDIT_CHECKOUT_RETURN } from "@/lib/audit-checkout-return";
import { CabinetActivateProvider } from "@/lib/cabinet-activate-context";
import type { DashboardTab } from "@/components/dashboard/DashboardTabBar";
import type { StartCheckoutOptions } from "@/lib/use-audit-checkout";
import { CabinetPwaProvider, useCabinetPwaContext } from "@/lib/pwa/cabinet-pwa-context";
import { CabinetOfflineBanner } from "@/components/dashboard/CabinetOfflineBanner";
import { CabinetUpdateBanner } from "@/components/dashboard/CabinetUpdateBanner";

type DashboardShellProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  showTabs?: boolean;
  subscriptionActive: boolean;
  startCheckout: (options?: StartCheckoutOptions) => void | Promise<void>;
  isCheckoutLoading?: boolean;
  activateReturnPath?: string;
  onCreateSavingPlan: () => void;
  isCreatingPlan?: boolean;
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
  onCreateSavingPlan,
  isCreatingPlan = false,
  children,
}: DashboardShellProps) {
  const { isOffline, updateAvailable } = useCabinetPwaContext();

  const copyright = footerContent.copyrightTemplate.replace(
    "{year}",
    String(new Date().getFullYear()),
  );

  return (
    <CabinetActivateProvider
      startCheckout={startCheckout}
      isCheckoutLoading={isCheckoutLoading}
      defaultReturnPath={activateReturnPath}
    >
      <div className="flex min-h-[100dvh] w-full flex-col bg-[var(--page-bg)] text-[var(--neutral-theme-900)]">
        <CabinetUpdateBanner visible={updateAvailable} />
        <CabinetOfflineBanner visible={isOffline} />
        <CabinetAppBanner subscriptionActive={subscriptionActive} />

        <CabinetHeader
          activeTab={activeTab}
          onTabChange={onTabChange}
          showTabs={showTabs}
          onCreateSavingPlan={onCreateSavingPlan}
          isCreatingPlan={isCreatingPlan}
          isOffline={isOffline}
          subscriptionActive={subscriptionActive}
        />

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
