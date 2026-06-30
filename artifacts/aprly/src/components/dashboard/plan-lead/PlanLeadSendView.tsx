import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { PlanLeadDetail } from "@workspace/api-client-react";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { PlanLeadDetailHeader } from "@/components/dashboard/plan-lead/PlanLeadDetailHeader";
import { PlanLeadDetailMetricsStrip } from "@/components/dashboard/plan-lead/PlanLeadDetailMetricsStrip";
import { PlanLeadEditableCards } from "@/components/dashboard/plan-lead/PlanLeadEditableCards";
import { PartnerNameModal } from "@/components/dashboard/PartnerNameModal";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { useAuth } from "@/lib/auth-session";

type PlanLeadSendViewProps = {
  detail: PlanLeadDetail;
  planIndex: number;
  returnTo: string;
  isSavingCards?: boolean;
  isAddingCard?: boolean;
  isDeletingPlan?: boolean;
  onDeleteCard: (cardId: number) => void;
  onDeletePlan?: () => void | Promise<void>;
  onAddCard: () => void;
  onOpenPartnerModal: () => void;
};

export function PlanLeadSendView({
  detail,
  planIndex,
  returnTo,
  isSavingCards = false,
  isAddingCard = false,
  isDeletingPlan = false,
  onDeleteCard,
  onDeletePlan,
  onAddCard,
  onOpenPartnerModal,
}: PlanLeadSendViewProps) {
  const copy = dashboardTabContent.planCard;
  const { user } = useAuth();
  const [nameModalOpen, setNameModalOpen] = useState(false);

  const userHasNames = Boolean(user?.firstName?.trim() && user?.lastName?.trim());

  const onNegotiateClick = () => {
    if (!userHasNames) {
      setNameModalOpen(true);
      return;
    }
    onOpenPartnerModal();
  };

  return (
    <div className="dash-plan-detail-stack">
      <PlanLeadDetailHeader
        planIndex={planIndex}
        returnTo={returnTo}
        canDeletePlan={detail.status === "recommended"}
        onDeletePlan={onDeletePlan}
        isDeletingPlan={isDeletingPlan}
      />
      <PlanLeadDetailMetricsStrip detail={detail} />

      <div className="dash-plan-detail-negotiate-row">
        <button
          type="button"
          className="dash-plan-detail-negotiate-btn app-button-button-xl text-neutral-000"
          onClick={onNegotiateClick}
        >
          {copy.negotiate}
        </button>
      </div>

      {detail.cards.length > 0 ? (
        <section className="dash-plan-detail-cards-section">
          <div className="dash-plan-detail-cards-head">
            <h2 className="dash-plan-detail-cards-title app-header-h6 text-average">
              {planLeadDetailContent.yourCards}
            </h2>
            <button
              type="button"
              className="dash-plan-add-card-btn app-button-button-l-m text-action"
              disabled={isAddingCard}
              onClick={onAddCard}
            >
              {isAddingCard ? (
                <Loader2 className="h-6 w-6 shrink-0 animate-spin" aria-hidden="true" />
              ) : (
                <img
                  src={cabinetAsset("cabinet/dashboard/plus.svg")}
                  alt=""
                  aria-hidden
                  className="h-6 w-6 shrink-0"
                />
              )}
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

      <PartnerNameModal
        open={nameModalOpen}
        onOpenChange={setNameModalOpen}
        onComplete={onOpenPartnerModal}
      />
    </div>
  );
}
