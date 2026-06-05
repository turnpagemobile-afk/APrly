import type { ReactNode } from "react";
import { Link } from "wouter";
import type { AdminUserPlanDisplayStatus, LeadCardItem } from "@workspace/api-client-react";
import { PlanLeadCardPreviewRow } from "@/components/dashboard/plan-lead/PlanLeadCardPreviewRow";
import { dashboardTabContent } from "@/content/dashboard-tab";
import {
  adminPlanDisplayStatusLabel,
  adminPlanStatusBadgeClass,
} from "@/lib/admin-plan-lead-status";
import { formatDashboardCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

type AdminPlanLeadListCardProps = {
  title: string;
  subtitle?: string | null;
  displayStatus: AdminUserPlanDisplayStatus;
  cards: LeadCardItem[];
  balance: number;
  currentApr: number;
  targetApr: number;
  estimatedAnnualSavings: number;
  detailHref: string;
  detailAriaLabel: string;
  actions?: ReactNode;
};

function aggregateFallbackCard(props: Omit<AdminPlanLeadListCardProps, "cards" | "actions">): LeadCardItem {
  return {
    id: 0,
    brand: props.title,
    balance: props.balance,
    currentApr: props.currentApr,
    targetApr: props.targetApr,
    estimatedAnnualSavings: props.estimatedAnnualSavings,
  };
}

export function AdminPlanLeadListCard({
  title,
  subtitle,
  displayStatus,
  cards,
  balance,
  currentApr,
  targetApr,
  estimatedAnnualSavings,
  detailHref,
  detailAriaLabel,
  actions,
}: AdminPlanLeadListCardProps) {
  const copy = dashboardTabContent.planCard;
  const previewCards = cards.length > 0 ? cards : [aggregateFallbackCard({
    title,
    displayStatus,
    balance,
    currentApr,
    targetApr,
    estimatedAnnualSavings,
    detailHref,
    detailAriaLabel,
  })];

  const totalYearlySavings =
    cards.length > 0
      ? cards.reduce((sum, c) => sum + c.estimatedAnnualSavings, 0)
      : estimatedAnnualSavings;

  const footerLabel = `${copy.totalEstSaving} ${formatDashboardCurrency(totalYearlySavings, 0, { spaceAfterDollar: false })}${copy.perYear}`;

  return (
    <article className="dash-plan-lead-card dash-plan-lead-card--interactive">
      <div className="dash-plan-lead-card-inner">
        <div className="dash-plan-lead-header">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="dash-text-lg-xb truncate uppercase">{title}</h3>
              <span className={cn(adminPlanStatusBadgeClass(displayStatus))}>
                {adminPlanDisplayStatusLabel(displayStatus)}
              </span>
            </div>
            {subtitle ? (
              <p className="mt-1 truncate text-sm font-normal normal-case tracking-normal text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
        </div>

        <div className="dash-plan-lead-body">
          <ul className="space-y-3">
            {previewCards.map((card) => (
              <li key={card.id}>
                <PlanLeadCardPreviewRow card={card} />
              </li>
            ))}
          </ul>

          <Link href={detailHref} className="dash-plan-lead-total-btn" aria-label={detailAriaLabel}>
            {footerLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
