import { dashboardTabContent } from "@/content/dashboard-tab";
import { cn } from "@/lib/utils";

type SubscriptionStatusCardProps = {
  active: boolean;
};

export function SubscriptionStatusCard({ active }: SubscriptionStatusCardProps) {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card p-5")}>
      <p className="text-sm font-medium text-muted-foreground">
        {dashboardTabContent.subscriptionCard.title}
      </p>
      <p className="mt-2 flex items-center gap-2 text-base font-bold text-foreground">
        <span
          className={cn(
            "inline-block h-2.5 w-2.5 rounded-full",
            active ? "bg-emerald-500" : "bg-red-500",
          )}
          aria-hidden="true"
        />
        {active
          ? dashboardTabContent.subscriptionCard.active
          : dashboardTabContent.subscriptionCard.disabled}
      </p>
    </div>
  );
}
