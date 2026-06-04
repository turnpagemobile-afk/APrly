import { Link } from "wouter";
import type { PlanLeadDetail } from "@workspace/api-client-react";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { PlanLeadDetailHeader } from "@/components/dashboard/plan-lead/PlanLeadDetailHeader";
import { PlanLeadDetailMetricsStrip } from "@/components/dashboard/plan-lead/PlanLeadDetailMetricsStrip";

type PlanLeadDeniedViewProps = {
  detail: PlanLeadDetail;
  planIndex: number;
  returnTo: string;
};

export function PlanLeadDeniedView({ detail, planIndex, returnTo }: PlanLeadDeniedViewProps) {
  const copy = planLeadDetailContent.status;

  return (
    <div className="dash-plan-detail-stack">
      <PlanLeadDetailHeader planIndex={planIndex} returnTo={returnTo} />
      <PlanLeadDetailMetricsStrip detail={detail} />
      <p className="dash-plan-detail-denied-message">{copy.deniedDescription}</p>
      <div className="dash-plan-detail-back-btn-row">
        <Link href={returnTo} className="dash-account-primary-btn">
          {planLeadDetailContent.backAriaLabel}
        </Link>
      </div>
    </div>
  );
}
