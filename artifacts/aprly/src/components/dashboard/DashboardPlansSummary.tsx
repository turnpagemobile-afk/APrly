import type { DashboardPlansSummary as DashboardPlansSummaryData } from "@workspace/api-client-react";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { formatMeltCountdown } from "@/lib/melt-countdown";
import { formatDashboardCurrency } from "@/lib/format-currency";
import { MeltCountdownSummaryCard } from "@/components/dashboard/MeltCountdownSummaryCard";
import { SubscriptionStatusCard } from "@/components/dashboard/SubscriptionStatusCard";
import { cn } from "@/lib/utils";

type DashboardPlansSummaryProps = {
  subscriptionActive: boolean;
  summary: DashboardPlansSummaryData;
};

function SummaryMetricCard({
  label,
  value,
  variant,
  valueClassName,
  iconSrc,
}: {
  label: string;
  value: string;
  variant: "default" | "debt" | "savings";
  valueClassName?: string;
  iconSrc?: string;
}) {
  return (
    <div
      className={cn(
        "dash-summary-tile",
        variant === "debt" && "bg-[var(--danger-theme-500)] text-white",
        variant === "savings" && "bg-[var(--secondary-theme-500)] text-white",
        variant === "default" &&
          "border border-[var(--card-border-color)] bg-[var(--card-1lvl-bg-color)]",
      )}
    >
      {iconSrc ? (
        <img src={iconSrc} alt="" aria-hidden className="dash-metric-card-bg-icon" />
      ) : null}
      <div className="dash-metric-card-stack">
        <p
          className={cn(
            "dash-display-value",
            variant === "debt" && "text-white",
            variant === "savings" && "text-white",
            variant === "default" && "text-[var(--neutral-theme-900)]",
            valueClassName,
          )}
        >
          {value}
        </p>
        <p
          className={cn(
            "dash-display-label",
            variant === "default"
              ? "text-[var(--hint-text-color)]"
              : "text-white/90",
          )}
        >
          {label}
        </p>
      </div>
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
    <div className="dash-plans-summary-grid">
      <SubscriptionStatusCard active={subscriptionActive} />
      <SummaryMetricCard
        label={copy.totalDebt}
        value={formatDashboardCurrency(summary.totalDebt)}
        variant="debt"
        iconSrc={cabinetAsset("cabinet/dashboard/fire.svg")}
      />
      <SummaryMetricCard
        label={copy.estimatedSavings}
        value={formatDashboardCurrency(summary.estimatedAnnualSavings)}
        variant="savings"
        iconSrc={cabinetAsset("cabinet/dashboard/pig.svg")}
      />
      <MeltCountdownSummaryCard
        display={melt.display}
        label={copy.meltCountdown}
      />
    </div>
  );
}
