import { Check } from "lucide-react";
import type { PlanLeadDetail, PlanLeadStatus } from "@workspace/api-client-react";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { formatDashboardCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

type PlanLeadDetailMetricsStripProps = {
  detail: Pick<
    PlanLeadDetail,
    "status" | "balance" | "currentApr" | "estimatedAnnualSavings" | "targetApr"
  >;
  statusLabel?: string;
  visualStatus?: PlanLeadStatus;
};

function statusBadgeLabel(status: PlanLeadStatus): string {
  const copy = dashboardTabContent.planStatus;
  switch (status) {
    case "recommended":
      return copy.waiting;
    case "in_progress":
      return copy.inProgress;
    case "won":
      return copy.won;
    case "denied":
      return copy.denied;
    default:
      return copy.waiting;
  }
}

function statusBadgeClass(status: PlanLeadStatus): string {
  switch (status) {
    case "recommended":
      return "dash-plan-status-badge dash-plan-status-badge--waiting";
    case "in_progress":
      return "dash-plan-status-badge dash-plan-status-badge--in-progress";
    case "won":
      return "dash-plan-status-badge dash-plan-status-badge--won";
    case "denied":
      return "dash-plan-status-badge bg-white/20 text-white";
    default:
      return "dash-plan-status-badge dash-plan-status-badge--waiting";
  }
}

export function PlanLeadDetailMetricsStrip({
  detail,
  statusLabel: statusLabelOverride,
  visualStatus,
}: PlanLeadDetailMetricsStripProps) {
  const metrics = planLeadDetailContent.metrics;
  const tileStatus = visualStatus ?? detail.status;
  const statusLabel = statusLabelOverride ?? statusBadgeLabel(detail.status);

  return (
    <div className="dash-plan-detail-metrics">
      <div
        className={cn(
          "dash-plan-detail-status-tile",
          tileStatus === "won" && "dash-plan-detail-status-tile--won",
          tileStatus === "denied" && "dash-plan-detail-status-tile--denied",
        )}
      >
        <div className="dash-metric-card-stack">
          {tileStatus === "won" ? (
            <Check className="dash-plan-detail-status-won-icon" aria-hidden="true" />
          ) : null}
          <p
            className={cn(
              "dash-display-label",
              tileStatus === "won" || tileStatus === "denied"
                ? "text-white/90"
                : "text-[var(--hint-text-color)]",
            )}
          >
            {metrics.planStatus}
          </p>
          <span className={statusBadgeClass(tileStatus)}>{statusLabel}</span>
        </div>
      </div>

      <div className="dash-summary-tile bg-[var(--danger-theme-500)] text-white">
        <img
          src={cabinetAsset("cabinet/dashboard/fire.svg")}
          alt=""
          aria-hidden
          className="dash-metric-card-bg-icon"
        />
        <div className="dash-metric-card-stack">
          <p className="dash-display-value text-white">
            {formatDashboardCurrency(detail.balance, 0)}
          </p>
          <p className="dash-display-label text-white/90">{metrics.totalPlanDebt}</p>
        </div>
      </div>

      <div className="dash-plan-detail-metric-outline--rate-high">
        <div className="dash-metric-card-stack">
          <p className="dash-display-value dash-plan-detail-metric-value--danger">
            {detail.currentApr.toFixed(2)} %
          </p>
          <p className="dash-display-label text-[var(--hint-text-color)]">
            {metrics.initialAverageRate}
          </p>
        </div>
      </div>

      <div className="dash-summary-tile bg-[var(--secondary-theme-500)] text-white">
        <img
          src={cabinetAsset("cabinet/dashboard/pig.svg")}
          alt=""
          aria-hidden
          className="dash-metric-card-bg-icon"
        />
        <div className="dash-metric-card-stack">
          <p className="dash-display-value text-white">
            {formatDashboardCurrency(detail.estimatedAnnualSavings, 0)}
          </p>
          <p className="dash-display-label text-white/90">{metrics.estimatedSavings}</p>
        </div>
      </div>

      <div className="dash-plan-detail-metric-outline--rate-low">
        <div className="dash-metric-card-stack">
          <p className="dash-display-value dash-plan-detail-metric-value--success">
            {detail.targetApr.toFixed(2)}%
          </p>
          <p className="dash-display-label text-[var(--hint-text-color)]">
            {metrics.estAverageRate}
          </p>
        </div>
      </div>
    </div>
  );
}
