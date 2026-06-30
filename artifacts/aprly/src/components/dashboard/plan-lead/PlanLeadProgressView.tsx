import { Building2 } from "lucide-react";
import type { PlanLeadDetail } from "@workspace/api-client-react";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { PlanLeadDetailHeader } from "@/components/dashboard/plan-lead/PlanLeadDetailHeader";
import { PlanLeadDetailMetricsStrip } from "@/components/dashboard/plan-lead/PlanLeadDetailMetricsStrip";
import { LeadCardsList } from "@/components/dashboard/plan-lead/LeadCardsList";
import { HardshipPortalStepper } from "@/components/dashboard/plan-lead/HardshipPortalStepper";

type PlanLeadProgressViewProps = {
  detail: PlanLeadDetail;
  planIndex: number;
  returnTo: string;
};

function formatSentDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatReviewDate(createdAt: string): string {
  const d = new Date(createdAt);
  d.setMonth(d.getMonth() + 6);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PlanLeadProgressView({
  detail,
  planIndex,
  returnTo,
}: PlanLeadProgressViewProps) {
  const sentLabel = detail.sentToPartnerAt
    ? planLeadDetailContent.partnerSent(formatSentDate(detail.sentToPartnerAt))
    : null;

  return (
    <div className="dash-plan-detail-stack">
      <PlanLeadDetailHeader planIndex={planIndex} returnTo={returnTo} />
      <PlanLeadDetailMetricsStrip detail={detail} />

      {detail.partner ? (
        <article className="dash-plan-detail-partner">
          <span className="dash-plan-detail-partner-icon" aria-hidden="true">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="dash-plan-detail-partner-name">{detail.partner.name}</p>
            {sentLabel ? <p className="dash-plan-detail-partner-meta">{sentLabel}</p> : null}
          </div>
        </article>
      ) : null}

      {detail.cards.length > 0 ? (
        <section className="dash-plan-detail-cards-section">
          <h2 className="dash-plan-detail-cards-title app-header-h6 text-average">
            {planLeadDetailContent.yourCards}
          </h2>
          <LeadCardsList cards={detail.cards} />
        </section>
      ) : null}

      {detail.status === "won" ? (
        <p className="dash-plan-detail-review-banner app-text-p1-bold text-title">
          {planLeadDetailContent.reviewBanner(formatReviewDate(detail.createdAt))}
        </p>
      ) : null}

      {detail.hardshipPortal ? (
        <HardshipPortalStepper portal={detail.hardshipPortal} />
      ) : null}
    </div>
  );
}
