import { cn } from "@/lib/utils";
import { cabinetShellContent } from "@/content/dashboard-home";

export type DashboardTab = "home" | "dashboard";

type DashboardTabBarLayout = "center" | "split";

type DashboardTabBarProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  layout?: DashboardTabBarLayout;
  className?: string;
};

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "home", label: cabinetShellContent.tabs.home },
  { id: "dashboard", label: cabinetShellContent.tabs.dashboard },
];

export function DashboardTabBar({
  activeTab,
  onTabChange,
  layout = "center",
  className,
}: DashboardTabBarProps) {
  const isSplit = layout === "split";

  return (
    <nav
      className={cn(
        isSplit ? "grid w-full grid-cols-2" : "flex items-center justify-center gap-10",
        className,
      )}
      aria-label="Dashboard sections"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "border-b-2 text-xs uppercase tracking-widest transition-colors bp600:text-sm",
              isSplit
                ? "flex w-full min-h-[44px] items-center justify-center py-3"
                : "pb-3 pt-1",
              isActive
                ? "border-primary font-bold text-[var(--neutral-theme-900)]"
                : "border-transparent font-semibold text-[var(--info-theme-500)] hover:text-[var(--info-theme-500)]",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
