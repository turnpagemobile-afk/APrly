import { dashboardTabContent } from "@/content/dashboard-tab";
import { cn } from "@/lib/utils";

type SubscriptionStatusCardProps = {
  active: boolean;
};

export function SubscriptionStatusCard({ active }: SubscriptionStatusCardProps) {
  return (
    <div
      className={cn(
        "box-border flex h-[98px] w-full max-w-[220px] flex-col justify-center gap-2.5 rounded-2xl bg-[var(--card-1lvl-bg-color)] p-4",
        active
          ? "border-2 border-[var(--success-theme-400)]"
          : "border-2 border-[var(--danger-theme-400)]",
      )}
    >
      <span
        className={cn(
          "inline-flex h-8 w-[114px] items-center gap-2 rounded-full px-2.5 uppercase tracking-wide",
          "app-text-p2-bold text-average",
          active ? "bg-[var(--success-theme-200)]" : "bg-[var(--danger-theme-200)]",
        )}
      >
        <span
          className={cn(
            "h-5 w-5 shrink-0 rounded-full",
            active
              ? "bg-[var(--palette-functional-success-success-500)]"
              : "bg-[var(--palette-functional-danger-danger-500)]",
          )}
          aria-hidden
        />
        {active
          ? dashboardTabContent.subscriptionCard.active
          : dashboardTabContent.subscriptionCard.disabled}
      </span>
      <p
        className={cn(
          "app-text-p2-bold uppercase",
          active
            ? "text-[var(--success-theme-900)]"
            : "text-[var(--danger-theme-900)]",
        )}
      >
        {dashboardTabContent.subscriptionCard.title}
      </p>
    </div>
  );
}
