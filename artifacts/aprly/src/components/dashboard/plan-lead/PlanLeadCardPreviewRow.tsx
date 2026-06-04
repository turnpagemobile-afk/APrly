import type { LeadCardItem } from "@workspace/api-client-react";
import { PlanLeadAprPills } from "@/components/dashboard/plan-lead/PlanLeadAprPills";
import { formatDashboardCurrency } from "@/lib/format-currency";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { cn } from "@/lib/utils";

type PlanLeadCardPreviewRowProps = {
  card: LeadCardItem;
  className?: string;
};

export function PlanLeadCardPreviewRow({ card, className }: PlanLeadCardPreviewRowProps) {
  const copy = dashboardTabContent.planCard;
  return (
    <div className={cn("dash-plan-card-widget", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <span className="dash-plan-card-icon-wrap" aria-hidden>
            <img
              src={cabinetAsset("cabinet/dashboard/card-label-icon.svg")}
              alt=""
              aria-hidden
              className="h-5 w-5"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="dash-text-lg-b truncate">{card.brand}</p>
            <div className="mt-2">
              <PlanLeadAprPills
                currentApr={card.currentApr}
                targetApr={card.targetApr}
              />
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="dash-text-lg-xb">
            {formatDashboardCurrency(card.balance, 2, { spaceAfterDollar: false })}
          </p>
          <p className="mt-2 dash-text-md-sb">
            {copy.estimatedSavings}{" "}
            <span className="dash-text-md-xb text-[var(--secondary-theme-500)]">
              {formatDashboardCurrency(card.estimatedAnnualSavings, 0, {
                spaceAfterDollar: false,
              })}
              {copy.perYearShort}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
