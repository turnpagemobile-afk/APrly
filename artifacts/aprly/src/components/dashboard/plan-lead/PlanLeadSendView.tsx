import { Loader2 } from "lucide-react";
import type { PlanLeadDetail } from "@workspace/api-client-react";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { PlanLeadDetailHeader } from "@/components/dashboard/plan-lead/PlanLeadDetailHeader";
import { PlanLeadDetailMetricsStrip } from "@/components/dashboard/plan-lead/PlanLeadDetailMetricsStrip";
import { PlanLeadEditableCards } from "@/components/dashboard/plan-lead/PlanLeadEditableCards";
import { cabinetAsset } from "@/lib/cabinet-assets";

type PlanLeadSendViewProps = {
  detail: PlanLeadDetail;
  planIndex: number;
  returnTo: string;
  isSavingCards?: boolean;
  onDeleteCard: (cardId: number) => void;
  onAddCard: () => void;
  onOpenPartnerModal: () => void;
};

export function PlanLeadSendView({
  detail,
  planIndex,
  returnTo,
  isSavingCards = false,
  onDeleteCard,
  onAddCard,
  onOpenPartnerModal,
}: PlanLeadSendViewProps) {
  const copy = dashboardTabContent.planCard;

  return (
    <div className="dash-plan-detail-stack">
      <PlanLeadDetailHeader planIndex={planIndex} returnTo={returnTo} />
      <PlanLeadDetailMetricsStrip detail={detail} />

      <div className="dash-plan-detail-negotiate-row">
        <button
          type="button"
          className="dash-plan-detail-negotiate-btn"
          onClick={onOpenPartnerModal}
        >
          {copy.negotiate}
        </button>
      </div>

      {detail.cards.length > 0 ? (
        <section className="space-y-4">
          <div className="dash-plan-detail-cards-head">
            <h2 className="dash-plan-detail-cards-title">
              {planLeadDetailContent.yourCards}
            </h2>
            <button type="button" className="dash-plan-add-card-btn" onClick={onAddCard}>
              <img
                src={cabinetAsset("cabinet/dashboard/plus.svg")}
                alt=""
                aria-hidden
                className="h-7 w-7 shrink-0"
              />
              {planLeadDetailContent.addCard}
            </button>
          </div>
          {isSavingCards ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : null}
          <PlanLeadEditableCards
            cards={detail.cards}
            onDeleteCard={onDeleteCard}
            isDeleting={isSavingCards}
          />
        </section>
      ) : null}
    </div>
  );
}
