import type { AdminPlanLeadDetailResponse, AdminUserPlanDisplayStatus } from "@workspace/api-client-react";
import { adminContent } from "@/content/admin";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

function statusLabel(displayStatus: AdminUserPlanDisplayStatus) {
  const copy = adminContent.userDetail.planDisplayStatus;
  switch (displayStatus) {
    case "not_sent":
      return copy.notSent;
    case "on_review":
      return copy.onReview;
    case "in_progress":
      return copy.inProgress;
    case "won":
      return copy.won;
    case "rejected":
      return copy.rejected;
    default:
      return displayStatus;
  }
}

type AdminPlanMetricsStripProps = {
  detail: AdminPlanLeadDetailResponse;
};

export function AdminPlanMetricsStrip({ detail }: AdminPlanMetricsStripProps) {
  const copy = adminContent.adminPlanDetail;
  const items = [
    {
      label: copy.metricStatus,
      value: statusLabel(detail.displayStatus),
      className: "bg-card",
    },
    {
      label: copy.metricDebt,
      value: formatCurrency(detail.balance, 2),
      className: "bg-red-500/10",
    },
    {
      label: copy.metricCurrentRate,
      value: `${detail.currentApr.toFixed(2)}%`,
      className: "bg-red-500/10",
    },
    {
      label: copy.metricEstSavings,
      value: `${formatCurrency(detail.estimatedAnnualSavings)}${adminContent.userDetail.perYear}`,
      className: "bg-emerald-500/10",
    },
    {
      label: copy.metricRate,
      value: `${detail.targetApr.toFixed(1)}%`,
      className: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-lg border border-border/60 px-4 py-3 shadow-sm",
            item.className,
          )}
        >
          <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-lg font-bold text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
