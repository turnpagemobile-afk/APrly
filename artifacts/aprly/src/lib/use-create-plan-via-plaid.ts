import { useCallback } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardTabQueryKey,
  useCreateDetailedPlan,
} from "@workspace/api-client-react";
import { mapCardEntriesToImportItems } from "@/components/cards/mapCardEntries";
import {
  usePlaidCardImport,
  type PlaidImportedCard,
} from "@/components/cards/usePlaidCardImport";
import { createPlanContent } from "@/content/create-plan";
import { dashboardPromoContent } from "@/content/dashboard-home";
import { toast } from "@/hooks/use-toast";
import { pickNewestCreatedPlan, visiblePlanIndex } from "@/lib/pick-newest-created-plan";
import { planLeadHref } from "@/lib/plan-lead-navigation";
import { requireOnlineForCabinetAction } from "@/lib/pwa/use-cabinet-pwa";

type UseCreatePlanViaPlaidOptions = {
  returnTo: string;
  onPlaidCancel?: () => void;
};

function plaidRowsToCardEntries(rows: PlaidImportedCard[]) {
  return rows.map((r) => ({
    brand: r.brand,
    balance: String(r.balance),
    rate: String(r.rate),
    accountId: r.accountId,
  }));
}

export function useCreatePlanViaPlaid({ returnTo, onPlaidCancel }: UseCreatePlanViaPlaidOptions) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createPlan = useCreateDetailedPlan();

  const onImported = useCallback(
    (rows: PlaidImportedCard[]) => {
      const cards = mapCardEntriesToImportItems(plaidRowsToCardEntries(rows));
      if (!cards.length) return;

      void (async () => {
        try {
          const response = await createPlan.mutateAsync({ data: { cards } });
          const newest = pickNewestCreatedPlan(response);
          if (!newest) {
            toast({
              title: createPlanContent.errorTitle,
              description: createPlanContent.noCardsDescription,
              variant: "destructive",
            });
            return;
          }

          await queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
          const planIndex = visiblePlanIndex(response.plans);
          navigate(planLeadHref(newest.id, returnTo, { planIndex }));
        } catch {
          toast({
            title: createPlanContent.errorTitle,
            description: createPlanContent.errorDescription,
            variant: "destructive",
          });
        }
      })();
    },
    [createPlan, navigate, queryClient, returnTo],
  );

  const { startPlaid, plaidBusy } = usePlaidCardImport(undefined, {
    onImported,
    onExit: onPlaidCancel,
  });

  const startCreatePlan = useCallback(() => {
    if (!requireOnlineForCabinetAction()) {
      toast({
        title: dashboardPromoContent.offlineBanner,
        variant: "destructive",
      });
      return;
    }
    void startPlaid();
  }, [startPlaid]);

  const isCreatingPlan = plaidBusy || createPlan.isPending;
  const loaderLabel = createPlan.isPending
    ? createPlanContent.creatingLabel
    : createPlanContent.connectingLabel;

  return { startCreatePlan, isCreatingPlan, loaderLabel };
}
