import type { AdminPlanLeadDetailResponse } from "@workspace/api-client-react";
import { HardshipPortalStepper } from "@/components/dashboard/plan-lead/HardshipPortalStepper";
import { LeadCardsList } from "@/components/dashboard/plan-lead/LeadCardsList";
import {
  AdminPlanLeadDetailHeader,
  adminPlanDetailTitle,
} from "@/components/admin/AdminPlanLeadDetailHeader";
import { AdminPlanDetailMetricsStrip } from "@/components/admin/AdminPlanDetailMetricsStrip";
import { AdminPlanPartnerSection } from "@/components/admin/AdminPlanPartnerSection";
import { adminContent } from "@/content/admin";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { cn } from "@/lib/utils";

type PlanDetailContext =
  | { kind: "user"; userId: number; planId: number }
  | { kind: "partner"; partnerId: number; planId: number };

type AdminPlanLeadDetailViewProps = {
  detail: AdminPlanLeadDetailResponse;
  ctx: PlanDetailContext;
  backHref: string;
  printPending: boolean;
  isMutating: boolean;
  onPrint: () => void;
  onStartWorking: () => void;
  onCompleteStep: () => void;
  onReject: () => void;
  isStarting?: boolean;
  isCompleting?: boolean;
  isRejecting?: boolean;
};

function formatReviewDate(createdAt: string): string {
  const d = new Date(createdAt);
  d.setMonth(d.getMonth() + 6);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function AdminPlanLeadDetailView({
  detail,
  ctx,
  backHref,
  printPending,
  isMutating,
  onPrint,
  onStartWorking,
  onCompleteStep,
  onReject,
  isStarting,
  isCompleting,
  isRejecting,
}: AdminPlanLeadDetailViewProps) {
  const copy = adminContent.adminPlanDetail;

  const title = adminPlanDetailTitle(ctx.planId);

  const showPartnerSection =
    detail.partner != null &&
    detail.displayStatus !== "not_sent" &&
    (detail.displayStatus === "on_review" ||
      detail.displayStatus === "in_progress" ||
      detail.displayStatus === "won" ||
      detail.canStartWorking);

  return (
    <div className="dash-plan-detail-stack">
      <AdminPlanLeadDetailHeader
        backHref={backHref}
        title={title}
        printPending={printPending}
        printDisabled={isMutating}
        onPrint={onPrint}
      />

      <AdminPlanDetailMetricsStrip detail={detail} />

      {showPartnerSection ? (
        <AdminPlanPartnerSection
          detail={detail}
          onStartWorking={onStartWorking}
          onReject={onReject}
          isStarting={isStarting}
          isRejecting={isRejecting}
        />
      ) : null}

      {detail.cards.length > 0 ? (
        <section className="space-y-4">
          <h2 className="app-header-h6 text-average">{planLeadDetailContent.yourCards}</h2>
          <LeadCardsList cards={detail.cards} />
        </section>
      ) : null}

      {detail.displayStatus === "not_sent" ? (
        <p className="text-sm text-muted-foreground">{copy.notSentMessage}</p>
      ) : null}

      {detail.displayStatus === "won" ? (
        <p className="dash-plan-detail-review-banner text-sm text-[var(--neutral-theme-900)] bp600:text-base">
          {planLeadDetailContent.reviewBanner(formatReviewDate(detail.createdAt))}
        </p>
      ) : null}

      {detail.displayStatus === "rejected" ? (
        <p className="dash-plan-detail-denied-message">{copy.terminalRejected}</p>
      ) : null}

      {detail.hardshipPortal ? (
        <HardshipPortalStepper
          portal={detail.hardshipPortal}
          activeStepActionsPlacement="below"
          renderActiveStepActions={
            detail.canCompleteStep || detail.canReject
              ? () => (
                  <div className="admin-plan-detail-step-actions">
                    {detail.canCompleteStep ? (
                      <button
                        type="button"
                        className={cn(
                          "admin-plan-detail-btn admin-plan-detail-btn--primary app-button-button-l-m",
                        )}
                        disabled={isCompleting || isRejecting}
                        onClick={onCompleteStep}
                      >
                        {copy.complete}
                      </button>
                    ) : null}
                    {detail.canReject ? (
                      <button
                        type="button"
                        className={cn(
                          "admin-plan-detail-btn admin-plan-detail-btn--danger app-button-button-l-m",
                        )}
                        disabled={isCompleting || isRejecting}
                        onClick={onReject}
                      >
                        {copy.reject}
                      </button>
                    ) : null}
                  </div>
                )
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
