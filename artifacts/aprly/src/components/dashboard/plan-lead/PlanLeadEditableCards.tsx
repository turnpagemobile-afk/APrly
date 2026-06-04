import { useState } from "react";
import type { LeadCardItem } from "@workspace/api-client-react";
import { PlanLeadDetailCard } from "@/components/dashboard/plan-lead/PlanLeadDetailCard";
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
