import type { AdminPlanLeadDetailResponse } from "@workspace/api-client-react";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { adminContent } from "@/content/admin";
import {
  adminPlanDetailMetricTileClass,
  adminPlanDetailStatusValueClass,
  adminUserPlanDisplayStatusLabel,
} from "@/lib/admin-plan-lead-status";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { formatDashboardCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

type AdminPlanDetailMetricsStripProps = {
  detail: Pick<
    AdminPlanLeadDetailResponse,
    "displayStatus" | "hardshipPortal" | "balance" | "currentApr" | "estimatedAnnualSavings" | "targetApr"
  >;
};

export function AdminPlanDetailMetricsStrip({ detail }: AdminPlanDetailMetricsStripProps) {
  const metrics = planLeadDetailContent.metrics;
  const adminCopy = adminContent.adminPlanDetail;
  const badgeCtx = {
    displayStatus: detail.displayStatus,
    hardshipPortal: detail.hardshipPortal,
  };
  const statusValue = adminUserPlanDisplayStatusLabel(badgeCtx);

  return (
    <div className="dash-plan-detail-metrics">
      <div className={cn(adminPlanDetailMetricTileClass(badgeCtx))}>
        <div className="dash-metric-card-stack">
          <p className={cn("app-header-screen-title-bold", adminPlanDetailStatusValueClass(badgeCtx))}>
            {statusValue}
          </p>
          <p className="app-text-p2-bold uppercase text-average">{adminCopy.metricStatus}</p>
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
