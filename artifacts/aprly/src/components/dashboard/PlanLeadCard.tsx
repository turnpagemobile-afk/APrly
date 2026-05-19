import { CreditCard } from "lucide-react";
import { Link } from "wouter";
import type { PlanLead, PlanLeadStatus } from "@workspace/api-client-react";
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

export function PlanLeadCard({ plan, returnTo = DEFAULT_RETURN_TO }: PlanLeadCardProps) {
  const copy = dashboardTabContent.planCard;
  const detailHref = planLeadHref(plan.id, returnTo);
  const isNavigable = plan.status === "in_progress" || plan.status === "won";

  const cardBody = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
            <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{plan.brand}</h3>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(plan.balance, 2)}
            </p>
          </div>
        </div>
        {statusBadge(plan.status)}
      </div>

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

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {copy.estimatedSavings}{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(plan.estimatedAnnualSavings)}
            {copy.perYear}
          </span>
        </p>
        {plan.status === "recommended" ? (
          <Button type="button" size="sm" className="shrink-0 font-semibold" asChild>
            <Link href={detailHref}>{copy.negotiate}</Link>
          </Button>
        ) : null}
      </div>
    </>
  );

  if (isNavigable) {
    return (
      <Link
        href={detailHref}
        className="block rounded-lg border border-border/60 bg-card p-5 shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {cardBody}
      </Link>
    );
  }

  return (
    <article className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
      {cardBody}
    </article>
  );
}
