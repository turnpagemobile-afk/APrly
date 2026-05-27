import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { LeadCardItem } from "@workspace/api-client-react";
import {
  getGetDashboardTabQueryKey,
  getGetPlanLeadQueryKey,
} from "@workspace/api-client-react";
import { CardEntryList } from "@/components/cards/CardEntryList";
import { mapCardEntriesToImportItems } from "@/components/cards/mapCardEntries";
import { usePlaidCardImport } from "@/components/cards/usePlaidCardImport";
import type { CardEntry } from "@/components/landing/types";
import { accountsAreComplete } from "@/components/landing/optimizerAccounts";
import { createPlanContent } from "@/content/create-plan";
import { dashboardPromoContent } from "@/content/dashboard-home";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { toast } from "@/hooks/use-toast";
import { mapLeadCardsToImport } from "@/lib/plan-lead-cards";
import { updatePlanLeadCards } from "@/lib/payment-api";
import { requireOnlineForCabinetAction } from "@/lib/pwa/use-cabinet-pwa";
import { Button } from "@/components/ui/button";

type AddCardsToPlanFlowProps = {
  planLeadId: number;
  existingCards: LeadCardItem[];
  onCancel: () => void;
};

export function AddCardsToPlanFlow({
  planLeadId,
  existingCards,
  onCancel,
}: AddCardsToPlanFlowProps) {
  const queryClient = useQueryClient();
  const [accounts, setAccounts] = useState<CardEntry[]>([]);
  const { startPlaid, plaidBusy } = usePlaidCardImport(setAccounts);
  const cardsReady = useMemo(() => accountsAreComplete(accounts), [accounts]);

  const saveMutation = useMutation({
    mutationFn: async (newEntries: CardEntry[]) => {
      const newCards = mapCardEntriesToImportItems(newEntries);
      if (!newCards.length) return;
      const merged = [...mapLeadCardsToImport(existingCards), ...newCards];
      return updatePlanLeadCards(planLeadId, merged);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getGetPlanLeadQueryKey(planLeadId),
      });
      await queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
      toast({
        title: planLeadDetailContent.addCardsSuccessTitle,
        description: planLeadDetailContent.addCardsSuccessDescription,
      });
      onCancel();
    },
    onError: () => {
      toast({
        title: planLeadDetailContent.addCardsErrorTitle,
        description: planLeadDetailContent.addCardsErrorDescription,
        variant: "destructive",
      });
    },
  });

  const addManualCard = () => {
    setAccounts((prev) => [...prev, { brand: "", balance: "", rate: "" }]);
  };

  const onSave = () => {
    if (!requireOnlineForCabinetAction()) {
      toast({
        title: dashboardPromoContent.offlineBanner,
        variant: "destructive",
      });
      return;
    }
    void saveMutation.mutateAsync(accounts);
  };

  return (
    <div className="app-page-cabinet py-8">
      <h1 className="mb-3 text-2xl font-black tracking-tight text-foreground">
        {planLeadDetailContent.addCardsTitle}
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {planLeadDetailContent.addCardsDescription}
      </p>

      <div className="mx-auto flex max-w-lg flex-col items-center gap-6">
        {accounts.length > 0 ? (
          <div className="w-full">
            <CardEntryList accounts={accounts} setAccounts={setAccounts} />
          </div>
        ) : null}

        <Button
          type="button"
          variant="outline"
          className="w-full max-w-md font-semibold"
          disabled={plaidBusy}
          onClick={() => {
            if (!requireOnlineForCabinetAction()) {
              toast({
                title: dashboardPromoContent.offlineBanner,
                variant: "destructive",
              });
              return;
            }
            void startPlaid();
          }}
        >
          {plaidBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {createPlanContent.plaidCta}
        </Button>

        <p className="text-sm text-muted-foreground">{createPlanContent.manualHint}</p>

        <button
          type="button"
          className="text-sm font-bold text-primary hover:underline"
          onClick={addManualCard}
        >
          {createPlanContent.manualAdd}
        </button>

        <Button
          type="button"
          className="mt-4 w-full max-w-md font-semibold"
          disabled={!cardsReady || saveMutation.isPending}
          onClick={onSave}
        >
          {saveMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {planLeadDetailContent.addCardsSave}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full max-w-md font-semibold"
          onClick={onCancel}
        >
          {planLeadDetailContent.addCardsCancel}
        </Button>
      </div>
    </div>
  );
}
