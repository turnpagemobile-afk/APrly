import { CreditCard } from "lucide-react";
import { Link } from "wouter";
import type { PlanLead, PlanLeadStatus } from "@workspace/api-client-react";
import { PlanLeadCardPreviewRow } from "@/components/dashboard/plan-lead/PlanLeadCardPreviewRow";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { formatCurrency } from "@/lib/format-currency";
import { planLeadHref } from "@/lib/plan-lead-navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlanLeadCardProps = {
  plan: PlanLead;
  returnTo?: string;
};

const DEFAULT_RETURN_TO = "/dashboard?tab=dashboard";

function statusBadge(status: PlanLeadStatus) {
  const copy = dashboardTabContent.planStatus;
  switch (status) {
    case "in_progress":
      return (
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {copy.inProgress}
        </span>
      );
    case "won":
      return (
        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
          {copy.won}
        </span>
      );
    case "denied":
      return (
        <span className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">
          {copy.denied}
        </span>
      );
    default:
      return null;
  }
}

function AprSummary({ plan }: { plan: PlanLead }) {
  const copy = dashboardTabContent.planCard;
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-sm font-semibold text-destructive">
          {plan.currentApr.toFixed(2)}%
        </span>
        <span className="text-muted-foreground" aria-hidden="true">
          →
        </span>
        <span
          className={cn(
            "rounded-md border px-2 py-1 text-sm font-semibold",
            plan.status === "won"
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
          )}
        >
          {plan.targetApr.toFixed(1)}%
        </span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {copy.estimatedSavings}{" "}
        <span className="font-semibold text-foreground">
          {formatCurrency(plan.estimatedAnnualSavings)}
          {copy.perYear}
        </span>
      </p>
    </>
  );
}

export function PlanLeadCard({ plan, returnTo = DEFAULT_RETURN_TO }: PlanLeadCardProps) {
  const copy = dashboardTabContent.planCard;
  const detailHref = planLeadHref(plan.id, returnTo);
  const addCardHref = planLeadHref(plan.id, returnTo, { addCard: true });
  const isEditable = plan.status === "recommended";
  const isNavigable =
    plan.status === "in_progress" || plan.status === "won";
  const cards = plan.cards ?? [];

  const shellClass =
    "rounded-lg border border-border/60 bg-card p-5 shadow-sm transition-colors";

  const header = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-foreground">
            {plan.cardCount > 1
              ? `${plan.brand} · ${plan.cardCount} ${copy.cardsLabel}`
              : plan.brand}
          </h3>
          {plan.cardCount > 1 ? (
            <p className="text-sm text-muted-foreground">
              {formatCurrency(plan.balance, 2)} total
            </p>
          ) : cards.length === 1 ? (
            <p className="text-sm text-muted-foreground">{formatCurrency(plan.balance, 2)}</p>
          ) : null}
        </div>
      </div>
      {statusBadge(plan.status)}
    </div>
  );

  const cardsList =
    cards.length > 0 ? (
      <ul className="mt-4 space-y-2">
        {cards.map((card) => (
          <li key={card.id}>
            <PlanLeadCardPreviewRow card={card} />
          </li>
        ))}
      </ul>
    ) : null;

  if (isEditable) {
    return (
      <article className={shellClass}>
        {header}
        {cardsList}
        {isEditable ? (
          <Button type="button" variant="outline" size="sm" className="mt-3 w-full" asChild>
            <Link href={addCardHref}>{copy.addCard}</Link>
          </Button>
        ) : null}
        <AprSummary plan={plan} />
        <div className="mt-2 flex justify-end">
          <Button type="button" size="sm" className="font-semibold" asChild>
            <Link href={detailHref}>{copy.negotiate}</Link>
          </Button>
        </div>
      </article>
    );
  }

  if (isNavigable) {
    return (
      <Link
        href={detailHref}
        className={cn(shellClass, "block hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}
      >
        {header}
        {cardsList}
        <AprSummary plan={plan} />
      </Link>
    );
  }

  return (
    <article className={shellClass}>
      {header}
      {cardsList}
      <AprSummary plan={plan} />
    </article>
  );
}
