import { Link } from "wouter";
import type { LeadCardItem, PlanLead, PlanLeadStatus } from "@workspace/api-client-react";
import { PlanLeadCardPreviewRow } from "@/components/dashboard/plan-lead/PlanLeadCardPreviewRow";
import { PlanLeadTotalSavingsFooter } from "@/components/dashboard/plan-lead/PlanLeadTotalSavingsFooter";
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
                className="h-6 w-6"
              >
                <path
                  d="M12.793 3.79314C13.1835 3.40261 13.8165 3.40261 14.207 3.79314L21.707 11.2931C22.0975 11.6837 22.0975 12.3167 21.707 12.7072L14.207 20.2072C13.8165 20.5976 13.1835 20.5976 12.793 20.2072C12.4025 19.8167 12.4025 19.1837 12.793 18.7931L18.5859 13.0002H3C2.44776 13.0002 2.00007 12.5524 2 12.0002C2 11.4479 2.44772 11.0002 3 11.0002H18.5859L12.793 5.2072C12.4025 4.8167 12.4025 4.18367 12.793 3.79314Z"
                  fill="currentColor"
                />
              </svg>
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
            <Link
              href={addCardHref}
              className="dash-plan-add-card-btn app-button-button-l-m text-action"
            >
              <img
                src={cabinetAsset("cabinet/dashboard/plus.svg")}
                alt=""
                aria-hidden
                className="h-6 w-6 shrink-0"
              />
              {copy.addCard}
            </Link>
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
