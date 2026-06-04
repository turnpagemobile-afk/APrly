import type { LeadCardItem } from "@workspace/api-client-react";
import { Trash2 } from "lucide-react";
import { PlanLeadAprPills } from "@/components/dashboard/plan-lead/PlanLeadAprPills";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { formatDashboardCurrency } from "@/lib/format-currency";

type PlanLeadDetailCardProps = {
  card: LeadCardItem;
  canDelete?: boolean;
  cardsCount?: number;
  onDelete?: () => void;
  isDeleting?: boolean;
};

export function PlanLeadDetailCard({
  card,
  canDelete = false,
  cardsCount = 1,
  onDelete,
  isDeleting = false,
}: PlanLeadDetailCardProps) {
  const copy = dashboardTabContent.planCard;
  const showDelete = canDelete && cardsCount > 1 && onDelete;

  return (
    <article className="dash-plan-detail-card">
      <div className="dash-plan-detail-card-body">
        <div className="dash-plan-detail-card-top">
          <div className="dash-plan-detail-card-brand-row">
            <span className="dash-plan-detail-card-icon-wrap" aria-hidden="true">
              <img
                src={cabinetAsset("cabinet/dashboard/card-label-icon.svg")}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </span>
            <p className="dash-plan-detail-card-brand">{card.brand}</p>
          </div>
          <div className="dash-plan-detail-card-balance-col">
            <p className="dash-plan-detail-card-balance">
              {formatDashboardCurrency(card.balance, 2, { spaceAfterDollar: false })}
            </p>
            {showDelete ? (
              <button
                type="button"
                className="dash-plan-detail-card-delete"
                aria-label={`Delete ${card.brand}`}
                disabled={isDeleting}
                onClick={onDelete}
              >
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
        <PlanLeadAprPills currentApr={card.currentApr} targetApr={card.targetApr} />
      </div>
      <div className="dash-plan-detail-card-savings">
        <p className="dash-plan-detail-card-savings-text">
          {copy.estimatedSavings}{" "}
          <span className="dash-plan-detail-card-savings-amount">
            {formatDashboardCurrency(card.estimatedAnnualSavings, 0, {
              spaceAfterDollar: false,
            })}
            {copy.perYearShort}
          </span>
        </p>
      </div>
    </article>
  );
}
