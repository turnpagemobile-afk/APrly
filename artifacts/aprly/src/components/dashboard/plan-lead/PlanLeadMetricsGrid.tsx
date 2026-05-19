import type { PlanLeadDetail } from "@workspace/api-client-react";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { formatCurrency } from "@/lib/format-currency";

type PlanLeadMetricsGridProps = {
  detail: Pick<
    PlanLeadDetail,
    "balance" | "currentApr" | "estimatedAnnualSavings" | "targetApr"
  >;
};

export function PlanLeadMetricsGrid({ detail }: PlanLeadMetricsGridProps) {
  const copy = planLeadDetailContent.metrics;

  const items = [
    { label: copy.debt, value: formatCurrency(detail.balance, 2) },
    { label: copy.currentRate, value: `${detail.currentApr.toFixed(2)}%` },
    {
      label: copy.estimatedSavings,
      value: formatCurrency(detail.estimatedAnnualSavings),
    },
    { label: copy.targetRate, value: `${detail.targetApr.toFixed(1)}%` },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
        >
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-lg font-bold text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
