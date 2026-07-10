import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LeadCardItem } from "@workspace/api-client-react";
import {
  getGetDashboardTabQueryKey,
  getGetPlanLeadQueryKey,
} from "@workspace/api-client-react";
import { mapCardEntriesToImportItems } from "@/components/cards/mapCardEntries";
import {
  usePlaidCardImport,
  type PlaidImportedCard,
} from "@/components/cards/usePlaidCardImport";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { dashboardPromoContent } from "@/content/dashboard-home";
import { toast } from "@/hooks/use-toast";
import { mapLeadCardsToImport } from "@/lib/plan-lead-cards";
import { updatePlanLeadCards } from "@/lib/payment-api";
import { requireOnlineForCabinetAction } from "@/lib/pwa/use-cabinet-pwa";
import { normalizeCabinetUrl } from "@/lib/app-navigation";

type UseAddPlanLeadCardsViaPlaidOptions = {
  planLeadId: number;
  existingCards: LeadCardItem[];
  onSuccess?: () => void;
};

function plaidRowsToCardEntries(rows: PlaidImportedCard[]) {
  return rows.map((r) => ({
    brand: r.brand,
    balance: String(r.balance),
    rate: String(r.rate),
    accountId: r.accountId,
  }));
}

export function useAddPlanLeadCardsViaPlaid({
  planLeadId,
  existingCards,
  onSuccess,
}: UseAddPlanLeadCardsViaPlaidOptions) {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (cards: { brand: string; balance: number; rate: number; accountId?: string }[]) =>
      updatePlanLeadCards(planLeadId, cards),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getGetPlanLeadQueryKey(planLeadId),
      });
      await queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
      toast({
        title: planLeadDetailContent.addCardsSuccessTitle,
        description: planLeadDetailContent.addCardsSuccessDescription,
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: planLeadDetailContent.addCardsErrorTitle,
        description: planLeadDetailContent.addCardsErrorDescription,
        variant: "destructive",
      });
    },
  });

  const onImported = useCallback(
    (rows: PlaidImportedCard[]) => {
      const newCards = mapCardEntriesToImportItems(plaidRowsToCardEntries(rows));
      if (!newCards.length) return;

      const merged = [...mapLeadCardsToImport(existingCards), ...newCards];
      void saveMutation.mutateAsync(merged);
    },
    [existingCards, saveMutation],
  );

  const oauthReturnTo = normalizeCabinetUrl(
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : `/dashboard/plan-leads/${planLeadId}`,
  );

  const { startPlaid, plaidBusy } = usePlaidCardImport(undefined, {
    onImported,
    oauthFlow: "add-plan-cards",
    oauthReturnTo,
    oauthPlanLeadId: planLeadId,
  });

  const startPlaidAdd = useCallback(() => {
    if (!requireOnlineForCabinetAction()) {
      toast({
        title: dashboardPromoContent.offlineBanner,
        variant: "destructive",
      });
      return;
    }
    void startPlaid();
  }, [startPlaid]);

  const isBusy = plaidBusy || saveMutation.isPending;

  return { startPlaidAdd, isBusy };
}
