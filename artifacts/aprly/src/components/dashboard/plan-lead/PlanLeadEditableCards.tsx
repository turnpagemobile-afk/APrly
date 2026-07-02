import { useState } from "react";
import type { LeadCardItem } from "@workspace/api-client-react";
import { PlanLeadDetailCard } from "@/components/dashboard/plan-lead/PlanLeadDetailCard";
import { AccountConfirmDialog } from "@/components/dashboard/account/AccountConfirmDialog";
import { planLeadDetailContent } from "@/content/plan-lead-detail";

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
  const copy = planLeadDetailContent;

  if (!cards.length) return null;

  const onConfirmDelete = () => {
    if (pendingDeleteId == null) return;
    onDeleteCard(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <>
      <ul className="dash-plan-detail-cards-list">
        {cards.map((card) => (
          <li key={card.id}>
            <PlanLeadDetailCard
              card={card}
              canDelete
              cardsCount={cards.length}
              isDeleting={isDeleting}
              onDelete={() => setPendingDeleteId(card.id)}
            />
          </li>
        ))}
      </ul>

      <AccountConfirmDialog
        open={pendingDeleteId != null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title={copy.deleteCardConfirmTitle}
        message={copy.deleteCardConfirmMessage}
        confirmLabel={copy.deleteCardConfirm}
        cancelLabel={copy.cancel}
        onConfirm={onConfirmDelete}
        isPending={isDeleting}
      />
    </>
  );
}
