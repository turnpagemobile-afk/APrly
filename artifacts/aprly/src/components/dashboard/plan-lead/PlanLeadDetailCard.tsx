import type { LeadCardItem } from "@workspace/api-client-react";
import { PlanLeadCardPreviewRow } from "@/components/dashboard/plan-lead/PlanLeadCardPreviewRow";

type PlanLeadDetailCardProps = {
  card: LeadCardItem;
  canDelete?: boolean;
  cardsCount?: number;
  onDelete?: () => void;
  isDeleting?: boolean;
};

export function PlanLeadDetailCard({
  card,
  canDelete = false,
  cardsCount = 1,
  onDelete,
  isDeleting = false,
}: PlanLeadDetailCardProps) {
  return (
    <article className="dash-plan-detail-card">
      <PlanLeadCardPreviewRow
        card={card}
        variant="planDetail"
        canDelete={canDelete}
        cardsCount={cardsCount}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    </article>
  );
}
