import { useState } from "react";
import type { LeadCardItem } from "@workspace/api-client-react";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type PlanLeadEditableCardsProps = {
  cards: LeadCardItem[];
  onDeleteCard: (cardId: number) => void;
  isDeleting?: boolean;
};

export function PlanLeadEditableCards({
  cards,
  onDeleteCard,
  isDeleting = false,
}: PlanLeadEditableCardsProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  if (!cards.length) return null;

  return (
    <>
      <ul className="space-y-3">
        {cards.map((card) => (
          <li
            key={card.id}
            className="relative rounded-lg border border-border/60 bg-background/50 px-4 py-4"
          >
            {cards.length > 1 ? (
              <button
                type="button"
                className="absolute right-3 top-3 rounded-md p-1 text-destructive hover:bg-destructive/10"
                aria-label={`Delete ${card.brand}`}
                disabled={isDeleting}
                onClick={() => setPendingDeleteId(card.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
            <p className="pr-8 font-bold text-foreground">{card.brand}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(card.balance, 2)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-sm font-semibold text-destructive",
                )}
              >
                {card.currentApr.toFixed(2)}%
              </span>
              <span className="text-muted-foreground" aria-hidden="true">
                →
              </span>
              <span className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {card.targetApr.toFixed(1)}%
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Est. savings {formatCurrency(card.estimatedAnnualSavings, 0)}/yr
            </p>
          </li>
        ))}
      </ul>

      <AlertDialog
        open={pendingDeleteId != null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDeleteId != null) onDeleteCard(pendingDeleteId);
                setPendingDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
