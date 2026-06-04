import { dashboardTabContent } from "@/content/dashboard-tab";
import { cn } from "@/lib/utils";

type SubscriptionStatusCardProps = {
  active: boolean;
};

export function SubscriptionStatusCard({ active }: SubscriptionStatusCardProps) {
  return (
    <div className="dash-summary-tile border border-[var(--card-border-color)] bg-[var(--card-1lvl-bg-color)]">
      <div className="dash-metric-card-stack">
        <span
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 uppercase tracking-wide text-white dash-text-sm-sb",
            active ? "bg-[var(--secondary-theme-500)]" : "bg-[var(--danger-theme-500)]",
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full bg-white/90",
              !active && "opacity-80",
            )}
            aria-hidden
          />
          {active
            ? dashboardTabContent.subscriptionCard.active
            : dashboardTabContent.subscriptionCard.disabled}
        </span>
        <p className="dash-display-label text-[var(--neutral-theme-900)]">
          {dashboardTabContent.subscriptionCard.title}
        </p>
      </div>
    </div>
  );
}
