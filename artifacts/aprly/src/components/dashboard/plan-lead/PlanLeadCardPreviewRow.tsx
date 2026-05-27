import type { LeadCardItem } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

type PlanLeadCardPreviewRowProps = {
  card: LeadCardItem;
  className?: string;
};

/** Compact card row for plan lead list (read-only). */
export function PlanLeadCardPreviewRow({ card, className }: PlanLeadCardPreviewRowProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border/50 bg-background/40 px-3 py-2.5",
        className,
      )}
    >
      <p className="truncate text-sm font-bold text-foreground">{card.brand}</p>
      <p className="text-xs text-muted-foreground">{formatCurrency(card.balance, 2)}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded-md border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-xs font-semibold text-destructive">
          {card.currentApr.toFixed(2)}%
        </span>
        <span className="text-xs text-muted-foreground" aria-hidden="true">
          →
        </span>
        <span className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {card.targetApr.toFixed(1)}%
        </span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Est. savings{" "}
        <span className="font-semibold text-foreground">
          {formatCurrency(card.estimatedAnnualSavings, 0)}/yr
        </span>
      </p>
    </div>
  );
}
