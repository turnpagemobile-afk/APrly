import { Link } from "wouter";
import type { LeadCardItem, PlanLead, PlanLeadStatus } from "@workspace/api-client-react";
import { PlanLeadCardPreviewRow } from "@/components/dashboard/plan-lead/PlanLeadCardPreviewRow";
import { PlanLeadTotalSavingsFooter } from "@/components/dashboard/plan-lead/PlanLeadTotalSavingsFooter";
import { AddCardButton } from "@/components/shared/AddCardButton";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { planLeadHref } from "@/lib/plan-lead-navigation";
import { cn } from "@/lib/utils";

type PlanLeadCardProps = {
  plan: PlanLead;
  planIndex: number;
  returnTo?: string;
};

const DEFAULT_RETURN_TO = "/dashboard?tab=dashboard";

function statusBadge(status: PlanLeadStatus) {
  const copy = dashboardTabContent.planStatus;
  switch (status) {
    case "recommended":
      return (
        <span className="dash-plan-status-badge dash-plan-status-badge--waiting">
          {copy.waiting}
        </span>
      );
    case "in_progress":
      return (
        <span className="dash-plan-status-badge dash-plan-status-badge--in-progress">
          {copy.inProgress}
        </span>
      );
    case "won":
      return (
        <span className="dash-plan-status-badge dash-plan-status-badge--won">
          {copy.won}
        </span>
      );
    case "denied":
      return (
        <span className="rounded-full bg-[var(--danger-theme-100)] px-3 py-1 uppercase tracking-wide text-[var(--danger-theme-500)] dash-text-sm-sb">
          {copy.denied}
        </span>
      );
    default:
      return null;
  }
}

function planToPreviewCard(plan: PlanLead): LeadCardItem {
  return {
    id: 0,
    brand: plan.brand,
    balance: plan.balance,
    currentApr: plan.currentApr,
    targetApr: plan.targetApr,
    estimatedAnnualSavings: plan.estimatedAnnualSavings,
  };
}

export function PlanLeadCard({
  plan,
  planIndex,
  returnTo = DEFAULT_RETURN_TO,
}: PlanLeadCardProps) {
  const copy = dashboardTabContent.planCard;
  const detailHref = planLeadHref(plan.id, returnTo, { planIndex });
  const addCardHref = planLeadHref(plan.id, returnTo, { addCard: true, planIndex });
  const canAddCard = plan.status === "recommended";
  const canOpenDetail =
    plan.status === "recommended" ||
    plan.status === "in_progress" ||
    plan.status === "won";
  const cards = plan.cards ?? [];

  const totalYearlySavings =
    cards.length > 0
      ? cards.reduce((sum, c) => sum + c.estimatedAnnualSavings, 0)
      : plan.estimatedAnnualSavings;

  const shellClass = cn(
    "dash-plan-lead-card",
    canOpenDetail && "dash-plan-lead-card--interactive",
  );

  return (
    <article className={shellClass}>
      <div className="dash-plan-lead-card-inner">
        <div className="dash-plan-lead-header">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="app-header-screen-title-bold text-average truncate">
              {copy.planLabel} #{planIndex}
            </h3>
            {statusBadge(plan.status)}
          </div>
          {canOpenDetail ? (
            <Link
              href={detailHref}
              className="dash-plan-lead-chevron"
              aria-label={`${copy.planLabel} #${planIndex}`}
            >
              <img
                src={cabinetAsset("cabinet/dashboard/arrow.svg")}
                alt=""
                aria-hidden
                className="h-6 w-6"
              />
            </Link>
          ) : null}
        </div>

        <div className="dash-plan-lead-body">
          {cards.length > 0 ? (
            <ul className="space-y-3">
              {cards.map((card) => (
                <li key={card.id}>
                  <PlanLeadCardPreviewRow card={card} />
                </li>
              ))}
            </ul>
          ) : (
            <PlanLeadCardPreviewRow card={planToPreviewCard(plan)} />
          )}

          {canAddCard ? (
            <div className="flex justify-center">
              <AddCardButton asChild className="w-[186px]" label={copy.addCard}>
                <Link href={addCardHref} />
              </AddCardButton>
            </div>
          ) : null}

          {canOpenDetail ? (
            <Link href={detailHref} className="dash-plan-lead-total-btn">
              <PlanLeadTotalSavingsFooter totalYearlySavings={totalYearlySavings} />
            </Link>
          ) : (
            <div className="dash-plan-lead-total-btn">
              <PlanLeadTotalSavingsFooter totalYearlySavings={totalYearlySavings} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
