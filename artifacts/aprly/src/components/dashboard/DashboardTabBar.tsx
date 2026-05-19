import { cn } from "@/lib/utils";

export type DashboardTab = "home" | "dashboard";

type DashboardTabBarProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
};

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "dashboard", label: "Dashboard" },
];

export function DashboardTabBar({ activeTab, onTabChange }: DashboardTabBarProps) {
  return (
    <nav
      className="flex border-b border-border/60"
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
              "flex-1 py-3 text-sm font-semibold transition-colors",
              isActive
                ? "border-b-2 border-primary text-[var(--tabs-title-selected)]"
                : "text-muted-foreground hover:text-foreground",
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
