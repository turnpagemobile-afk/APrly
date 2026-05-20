import { ChevronRight, CreditCard, Printer } from "lucide-react";
import { Link } from "wouter";
import type { AdminUserPlanDisplayStatus, AdminUserPlanLeadRow } from "@workspace/api-client-react";
import { adminContent } from "@/content/admin";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type AdminUserPlanCardProps = {
  plan: AdminUserPlanLeadRow;
  userId: number;
};

function statusLabel(displayStatus: AdminUserPlanDisplayStatus) {
  const copy = adminContent.userDetail.planDisplayStatus;
  switch (displayStatus) {
    case "not_sent":
      return copy.notSent;
    case "on_review":
      return copy.onReview;
    case "in_progress":
      return copy.inProgress;
    case "won":
      return copy.won;
    case "rejected":
      return copy.rejected;
    default:
      return displayStatus;
  }
}

function statusBadgeClass(displayStatus: AdminUserPlanDisplayStatus) {
  switch (displayStatus) {
    case "won":
      return "bg-emerald-600 text-white";
    case "rejected":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function aprVariants(displayStatus: AdminUserPlanDisplayStatus) {
  switch (displayStatus) {
    case "on_review":
      return { current: "solid", target: "outlined" } as const;
    case "in_progress":
      return { current: "solid", target: "solid" } as const;
    case "won":
      return { current: "outlined", target: "solid" } as const;
    default:
      return { current: "solid", target: "outlined" } as const;
  }
}

function AprBadge({
  value,
  variant,
  tone,
}: {
  value: number;
  variant: "solid" | "outlined";
  tone: "destructive" | "success";
}) {
  const solid = variant === "solid";
  if (tone === "destructive") {
    return (
      <span
        className={cn(
          "rounded-md px-2 py-1 text-sm font-semibold",
          solid
            ? "border border-destructive/40 bg-destructive/10 text-destructive"
            : "border border-destructive/40 text-destructive",
        )}
      >
        {value.toFixed(2)}%
      </span>
    );
  }
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-sm font-semibold",
        solid
          ? "border border-emerald-600 bg-emerald-600 text-white"
          : "border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      )}
    >
      {value.toFixed(1)}%
    </span>
  );
}

export function AdminUserPlanCard({ plan, userId }: AdminUserPlanCardProps) {
  const copy = adminContent.userDetail;
  const variants = aprVariants(plan.displayStatus);

  const onPrint = () => {
    toast({
      title: copy.printComingSoon,
      description: copy.printComingSoonDescription,
    });
  };

  return (
    <article className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <h3 className="truncate font-bold text-primary">{plan.brand}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              statusBadgeClass(plan.displayStatus),
            )}
          >
            {statusLabel(plan.displayStatus)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            aria-label={copy.printPlanAria}
            onClick={onPrint}
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-primary" asChild>
            <Link href={`/admin/users/${userId}/plans/${plan.id}`} aria-label={plan.brand}>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      <p className="mt-4 text-center text-2xl font-bold tracking-tight text-foreground">
        {formatCurrency(plan.balance, 2)}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <AprBadge value={plan.currentApr} variant={variants.current} tone="destructive" />
        <span className="text-muted-foreground" aria-hidden="true">
          →
        </span>
        <AprBadge value={plan.targetApr} variant={variants.target} tone="success" />
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {copy.estimatedSavings}{" "}
        <span className="font-semibold text-foreground">
          {formatCurrency(plan.estimatedAnnualSavings)}
          {copy.perYear}
        </span>
      </p>
    </article>
  );
}
