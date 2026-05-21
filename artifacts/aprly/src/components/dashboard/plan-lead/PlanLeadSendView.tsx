import type { Partner, PlanLeadDetail } from "@workspace/api-client-react";
import { CreditCard } from "lucide-react";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { LeadCardsList } from "@/components/dashboard/plan-lead/LeadCardsList";
import { PlanLeadMetricsGrid } from "@/components/dashboard/plan-lead/PlanLeadMetricsGrid";
import { PlanLeadPartnerList } from "@/components/dashboard/plan-lead/PlanLeadPartnerList";

type PlanLeadSendViewProps = {
  detail: PlanLeadDetail;
  partners: Partner[];
  isSending: boolean;
  onSend: (partnerId: number) => void;
};

export function PlanLeadSendView({
  detail,
  partners,
  isSending,
  onSend,
}: PlanLeadSendViewProps) {
  const copy = planLeadDetailContent.status;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
          <CreditCard className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">
            {detail.cardCount > 1
              ? `${planLeadDetailContent.packageTitle} · ${detail.cardCount} cards`
              : detail.brand}
          </h1>
          {detail.cardCount > 1 ? (
            <p className="text-sm text-muted-foreground">{detail.brand}</p>
          ) : null}
        </div>
      </div>

      <section className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Status
        </p>
        <p className="mt-1 text-lg font-bold text-foreground">{copy.waiting}</p>
        <p className="mt-2 text-sm text-muted-foreground">{copy.waitingDescription}</p>
      </section>

      <PlanLeadMetricsGrid detail={detail} />

      {detail.cards.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {planLeadDetailContent.cardsSection}
          </h2>
          <LeadCardsList cards={detail.cards} />
        </section>
      ) : null}

      <PlanLeadPartnerList
        partners={partners}
        isSending={isSending}
        onSend={onSend}
      />
    </div>
  );
}
