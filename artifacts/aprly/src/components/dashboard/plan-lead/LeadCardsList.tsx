import type { LeadCardItem } from "@workspace/api-client-react";
import { PlanLeadDetailCard } from "@/components/dashboard/plan-lead/PlanLeadDetailCard";
import { cn } from "@/lib/utils";

type LeadCardsListProps = {
  cards: LeadCardItem[];
  className?: string;
};

export function LeadCardsList({ cards, className }: LeadCardsListProps) {
  if (!cards.length) return null;

  return (
    <ul className={cn("dash-plan-detail-cards-list", className)}>
      {cards.map((card) => (
        <li key={card.id}>
          <PlanLeadDetailCard card={card} />
        </li>
      ))}
    </ul>
  );
}
