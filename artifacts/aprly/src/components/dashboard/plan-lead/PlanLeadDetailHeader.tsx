import { Link } from "wouter";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { PlanDetailActionsMenu } from "@/components/dashboard/plan-lead/PlanDetailActionsMenu";
import { cabinetAsset } from "@/lib/cabinet-assets";

type PlanLeadDetailHeaderProps = {
  planIndex: number;
  returnTo: string;
  canDeletePlan?: boolean;
  onDeletePlan?: () => void | Promise<void>;
  isDeletingPlan?: boolean;
};

export function PlanLeadDetailHeader({
  planIndex,
  returnTo,
  canDeletePlan = false,
  onDeletePlan,
  isDeletingPlan = false,
}: PlanLeadDetailHeaderProps) {
  const title = `${dashboardTabContent.planCard.planLabel} #${planIndex}`;

  return (
    <header className="dash-plan-detail-header">
      <Link href={returnTo} className="dash-plan-detail-back">
        <img
          src={cabinetAsset("cabinet/dashboard/arrow-left.svg")}
          alt=""
          aria-hidden
          className="h-11 w-11 shrink-0"
        />
        <h1 className="dash-plan-detail-title app-header-screen-title-bold text-average">
          {title}
        </h1>
      </Link>
      {canDeletePlan && onDeletePlan ? (
        <PlanDetailActionsMenu onDeletePlan={onDeletePlan} isDeletingPlan={isDeletingPlan} />
      ) : null}
      <span className="sr-only">{planLeadDetailContent.backAriaLabel}</span>
    </header>
  );
}
