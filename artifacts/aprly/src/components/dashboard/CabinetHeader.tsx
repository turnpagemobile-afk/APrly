import { Link } from "wouter";
import { AuthBrandLogo } from "@/components/auth/AuthBrandLogo";
import { CabinetHeaderActions } from "@/components/dashboard/CabinetHeaderActions";
import { DashboardTabBar, type DashboardTab } from "@/components/dashboard/DashboardTabBar";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { brandContent } from "@/content/landing";
import { cn } from "@/lib/utils";

export type CabinetHeaderProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  showTabs?: boolean;
  onCreateSavingPlan: () => void;
  isCreatingPlan?: boolean;
  isOffline: boolean;
  subscriptionActive?: boolean;
};

export function CabinetHeader({
  activeTab,
  onTabChange,
  showTabs = true,
  onCreateSavingPlan,
  isCreatingPlan = false,
  isOffline,
  subscriptionActive = false,
}: CabinetHeaderProps) {
  const headerActionsProps = {
    isOffline,
    onCreateSavingPlan,
    isCreatingPlan,
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-[var(--page-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--page-bg)]/90",
        showTabs
          ? "border-b-0 bp1200:border-b bp1200:border-[var(--neutral-theme-200)]"
          : "border-b border-[var(--neutral-theme-200)]",
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
            <DashboardUserMenu subscriptionActive={subscriptionActive} />
          </div>
        </div>

        <div className="bp1200:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard?tab=home" aria-label={`${brandContent.name} home`}>
              <AuthBrandLogo size="header" className="!text-left" />
            </Link>

            <div className="flex items-center justify-end gap-2">
              <CabinetHeaderActions variant="compact" {...headerActionsProps} />
              <DashboardUserMenu subscriptionActive={subscriptionActive} />
            </div>
          </div>

          {showTabs ? (
            <div className="-mx-4 mt-3 border-t border-[var(--neutral-theme-200)]/80 bp600:-mx-6">
              <DashboardTabBar activeTab={activeTab} onTabChange={onTabChange} layout="split" />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
