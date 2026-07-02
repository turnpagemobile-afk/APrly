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

function statusValueLabel(status: PlanLeadStatus): string {
  const tabCopy = dashboardTabContent.planStatus;
  const detailCopy = planLeadDetailContent.status;
  switch (status) {
    case "recommended":
      return tabCopy.waiting;
    case "in_progress":
      return detailCopy.inProgress;
    case "won":
      return tabCopy.won;
    case "denied":
      return tabCopy.denied;
    default:
      return tabCopy.waiting;
  }
}

function statusTileClass(status: PlanLeadStatus): string {
  switch (status) {
    case "recommended":
      return "dash-plan-detail-metric-tile--status-waiting";
    case "in_progress":
      return "dash-plan-detail-metric-tile--status-in-progress";
    case "won":
      return "dash-plan-detail-metric-tile--status-won";
    case "denied":
      return "dash-plan-detail-metric-tile--status-denied";
    default:
      return "dash-plan-detail-metric-tile--status-waiting";
  }
}

function statusValueClass(status: PlanLeadStatus): string {
  switch (status) {
    case "recommended":
      return "text-[var(--neutral-theme-500)]";
    case "in_progress":
      return "text-[var(--info-theme-500)]";
    case "won":
    case "denied":
      return "text-[var(--neutral-theme-000)]";
    default:
      return "text-[var(--neutral-theme-500)]";
  }
}

function statusLabelClass(status: PlanLeadStatus): string {
  switch (status) {
    case "recommended":
      return "text-average";
    case "in_progress":
      return "text-[var(--info-theme-900)]";
    case "won":
      return "text-[var(--success-theme-100)]";
    case "denied":
      return "text-[var(--neutral-theme-000)]/90";
    default:
      return "text-average";
  }
}

export function PlanLeadDetailMetricsStrip({
  detail,
  statusLabel: statusLabelOverride,
  visualStatus,
}: PlanLeadDetailMetricsStripProps) {
  const metrics = planLeadDetailContent.metrics;
  const tileStatus = visualStatus ?? detail.status;
  const statusValue = statusLabelOverride ?? statusValueLabel(detail.status);

  return (
    <div className="dash-plan-detail-metrics">
      <div className={cn("dash-plan-detail-metric-tile", statusTileClass(tileStatus))}>
        {tileStatus === "won" ? (
          <img
            src={cabinetAsset("cabinet/dashboard/won.png")}
            alt=""
            aria-hidden
            className="dash-metric-card-bg-icon dash-metric-card-bg-icon--won"
          />
        ) : null}
        <div className="dash-metric-card-stack">
          <p className={cn("app-header-screen-title-bold", statusValueClass(tileStatus))}>
            {statusValue}
          </p>
          <p className={cn("app-text-p2-bold", statusLabelClass(tileStatus))}>
            {metrics.planStatus}
          </p>
        </div>
      </div>

      <div className="dash-plan-detail-metric-tile dash-plan-detail-metric-tile--debt">
        <img
          src={cabinetAsset("cabinet/dashboard/fire.svg")}
          alt=""
          aria-hidden
          className="dash-metric-card-bg-icon"
        />
        <div className="dash-metric-card-stack">
          <p className="app-header-screen-title-bold text-[var(--neutral-theme-000)]">
            {formatDashboardCurrency(detail.balance, 0)}
          </p>
          <p className="app-text-p2-bold text-[var(--accent-theme-100)]">
            {metrics.totalPlanDebt}
          </p>
        </div>
      </div>

      <div className="dash-plan-detail-metric-tile dash-plan-detail-metric-tile--rate-high">
        <div className="dash-metric-card-stack">
          <p className="app-header-screen-title-bold text-[var(--accent-theme-500)]">
            {detail.currentApr.toFixed(2)} %
          </p>
          <p className="app-text-p2-bold text-[var(--accent-theme-900)]">
            {metrics.initialAverageRate}
          </p>
        </div>
      </div>

      <div className="dash-plan-detail-metric-tile dash-plan-detail-metric-tile--savings">
        <img
          src={cabinetAsset("cabinet/dashboard/pig.svg")}
          alt=""
          aria-hidden
          className="dash-metric-card-bg-icon"
        />
        <div className="dash-metric-card-stack">
          <p className="app-header-screen-title-bold text-[var(--neutral-theme-000)]">
            {formatDashboardCurrency(detail.estimatedAnnualSavings, 0)}
          </p>
          <p className="app-text-p2-bold text-[var(--success-theme-100)]">
            {metrics.estimatedSavings}
          </p>
        </div>
      </div>

      <div className="dash-plan-detail-metric-tile dash-plan-detail-metric-tile--rate-low">
        <div className="dash-metric-card-stack">
          <p className="app-header-screen-title-bold text-[var(--success-theme-500)]">
            {detail.targetApr.toFixed(2)}%
          </p>
          <p className="app-text-p2-bold text-[var(--success-theme-900)]">
            {metrics.estAverageRate}
          </p>
        </div>
      </div>
    </div>
  );
}
