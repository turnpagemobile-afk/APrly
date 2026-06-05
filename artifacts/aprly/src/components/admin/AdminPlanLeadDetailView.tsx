import type { AdminPlanLeadDetailResponse } from "@workspace/api-client-react";
import { HardshipPortalStepper } from "@/components/dashboard/plan-lead/HardshipPortalStepper";
import { LeadCardsList } from "@/components/dashboard/plan-lead/LeadCardsList";
import { PlanLeadDetailMetricsStrip } from "@/components/dashboard/plan-lead/PlanLeadDetailMetricsStrip";
import {
  AdminPlanLeadDetailHeader,
  adminPlanDetailTitle,
} from "@/components/admin/AdminPlanLeadDetailHeader";
import { AdminPlanPartnerSection } from "@/components/admin/AdminPlanPartnerSection";
import { adminContent } from "@/content/admin";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import {
  adminPlanDisplayStatusLabel,
  adminPlanVisualStatus,
} from "@/lib/admin-plan-lead-status";
import { Button } from "@/components/ui/button";

type PlanDetailContext =
  | { kind: "user"; userId: number; planId: number }
  | { kind: "partner"; partnerId: number; planId: number };

type AdminPlanLeadDetailViewProps = {
  detail: AdminPlanLeadDetailResponse;
  ctx: PlanDetailContext;
  backHref: string;
  planIndex: number | null;
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

function formatUserName(first?: string | null, last?: string | null) {
  const a = (first ?? "").trim();
  const b = (last ?? "").trim();
  return `${a} ${b}`.trim() || "—";
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

export function AdminPlanLeadDetailView({
  detail,
  ctx,
  backHref,
  planIndex,
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
  const visualStatus = adminPlanVisualStatus(detail.displayStatus);
  const statusLabel = adminPlanDisplayStatusLabel(detail.displayStatus);

  const title = adminPlanDetailTitle(
    ctx.kind === "user" ? planIndex : null,
    detail.brand,
  );

  const subtitle =
    ctx.kind === "partner"
      ? `${detail.user.email}${
          detail.user.firstName || detail.user.lastName
            ? ` · ${formatUserName(detail.user.firstName, detail.user.lastName)}`
            : ""
        }`
      : null;

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
        subtitle={subtitle}
        printPending={printPending}
        printDisabled={isMutating}
        onPrint={onPrint}
      />

      <PlanLeadDetailMetricsStrip
        detail={detail}
        visualStatus={visualStatus}
        statusLabel={statusLabel}
      />

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
          <h2 className="dash-plan-detail-cards-title">{planLeadDetailContent.yourCards}</h2>
          <LeadCardsList cards={detail.cards} />
        </section>
      ) : null}

      {detail.displayStatus === "not_sent" ? (
        <p className="text-sm text-muted-foreground">{copy.notSentMessage}</p>
      ) : null}

      {detail.displayStatus === "won" ? (
        <p className="dash-plan-detail-review-banner">
          {planLeadDetailContent.reviewBanner(formatReviewDate(detail.createdAt))}
        </p>
      ) : null}

      {detail.displayStatus === "rejected" ? (
        <p className="dash-plan-detail-denied-message">{copy.terminalRejected}</p>
      ) : null}

      {detail.hardshipPortal ? (
        <HardshipPortalStepper
          portal={detail.hardshipPortal}
          renderActiveStepActions={
            detail.canCompleteStep || detail.canReject
              ? () => (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {detail.canCompleteStep ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={isCompleting || isRejecting}
                        onClick={onCompleteStep}
                      >
                        {copy.complete}
                      </Button>
                    ) : null}
                    {detail.canReject ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        disabled={isCompleting || isRejecting}
                        onClick={onReject}
                      >
                        {copy.reject}
                      </Button>
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
