import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { planLeadDetailContent } from "@/content/plan-lead-detail";

type PlanLeadDetailHeaderProps = {
  planIndex: number;
  returnTo: string;
};

export function PlanLeadDetailHeader({ planIndex, returnTo }: PlanLeadDetailHeaderProps) {
  const title = `${dashboardTabContent.planCard.planLabel} #${planIndex}`;

  return (
    <header className="dash-plan-detail-header">
      <Link href={returnTo} className="dash-plan-detail-back">
        <ArrowLeft className="dash-plan-detail-back-icon" aria-hidden="true" />
        <h1 className="dash-plan-detail-title">{title}</h1>
      </Link>
      <span className="sr-only">{planLeadDetailContent.backAriaLabel}</span>
    </header>
  );
}
