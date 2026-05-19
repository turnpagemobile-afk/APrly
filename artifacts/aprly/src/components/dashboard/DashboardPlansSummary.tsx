import type { DashboardPlansSummary as DashboardPlansSummaryData } from "@workspace/api-client-react";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { formatMeltCountdown } from "@/lib/melt-countdown";
import { formatCurrency } from "@/lib/format-currency";
import { SubscriptionStatusCard } from "@/components/dashboard/SubscriptionStatusCard";
import { cn } from "@/lib/utils";

type DashboardPlansSummaryProps = {
  subscriptionActive: boolean;
  summary: DashboardPlansSummaryData;
};

function StatTile({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card p-4 shadow-sm",
        className,
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-extrabold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

export function DashboardPlansSummary({
  subscriptionActive,
  summary,
}: DashboardPlansSummaryProps) {
  const melt = formatMeltCountdown(summary.totalDebt);
  const copy = dashboardTabContent.summary;

  return (
    <div className="grid grid-cols-1 gap-4 cabinet:grid-cols-2 lg:grid-cols-4">
      <SubscriptionStatusCard active={subscriptionActive} />
      <StatTile
        label={copy.totalDebt}
        value={formatCurrency(summary.totalDebt)}
        className="bg-rose-500/10"
      />
      <StatTile
        label={copy.estimatedSavings}
        value={formatCurrency(summary.estimatedAnnualSavings)}
        className="bg-emerald-500/10"
      />
      <StatTile label={copy.meltCountdown} value={melt.label} />
    </div>
  );
}
