import type { LeadCardItem } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

type LeadCardsListProps = {
  cards: LeadCardItem[];
  className?: string;
};

export function LeadCardsList({ cards, className }: LeadCardsListProps) {
  if (!cards.length) return null;

  return (
    <ul className={cn("space-y-3", className)}>
      {cards.map((card) => (
        <li
          key={card.id}
          className="rounded-lg border border-border/60 bg-background/50 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-foreground">{card.brand}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(card.balance, 2)}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-destructive">
                {card.currentApr.toFixed(2)}%
              </p>
              <p className="text-muted-foreground">
                → {card.targetApr.toFixed(1)}%
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
