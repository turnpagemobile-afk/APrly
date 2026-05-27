import { useEffect, useMemo, useState } from "react";
import { readCreatePlanReturnTo } from "@/lib/create-plan-navigation";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  getGetDashboardTabQueryKey,
  useCreateDetailedPlan,
} from "@workspace/api-client-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CardEntryList } from "@/components/cards/CardEntryList";
import { mapCardEntriesToImportItems } from "@/components/cards/mapCardEntries";
import { usePlaidCardImport } from "@/components/cards/usePlaidCardImport";
import type { CardEntry } from "@/components/landing/types";
import { accountsAreComplete } from "@/components/landing/optimizerAccounts";
import { createPlanContent } from "@/content/create-plan";
import { dashboardSummaryContent } from "@/content/dashboard-home";
import { useDashboardSubscription } from "@/lib/use-dashboard-subscription";
import { requireOnlineForCabinetAction } from "@/lib/pwa/use-cabinet-pwa";
import { dashboardPromoContent } from "@/content/dashboard-home";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function CreateDetailedPlanPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const subscription = useDashboardSubscription(null);
  const createPlan = useCreateDetailedPlan();

  const [accounts, setAccounts] = useState<CardEntry[]>([]);
  const { startPlaid, plaidBusy } = usePlaidCardImport(setAccounts);

  const cardsReady = useMemo(() => accountsAreComplete(accounts), [accounts]);

  const returnTo = useMemo(
    () =>
      readCreatePlanReturnTo(
        typeof window !== "undefined" ? window.location.search : "",
      ),
    [],
  );

  const addManualCard = () => {
    setAccounts((prev) => [...prev, { brand: "", balance: "", rate: "" }]);
  };

  const onContinue = async () => {
    if (!requireOnlineForCabinetAction()) {
      toast({
        title: dashboardPromoContent.offlineBanner,
        variant: "destructive",
      });
      return;
    }
    const cards = mapCardEntriesToImportItems(accounts);
    if (!cards.length) return;

    try {
      await createPlan.mutateAsync({ data: { cards } });
      await queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
      toast({
        title: createPlanContent.successTitle,
        description: createPlanContent.successDescription,
      });
      navigate("/dashboard?tab=dashboard");
    } catch {
      toast({
        title: createPlanContent.errorTitle,
        description: createPlanContent.errorDescription,
        variant: "destructive",
      });
    }
  };

  if (subscription.isSubscriptionLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  return (
    <DashboardShell
      activeTab="home"
      onTabChange={() => {}}
      showTabs={false}
      subscriptionActive={subscription.subscriptionActive}
      onActivateSubscription={() => void subscription.startCheckout()}
      isCheckoutLoading={subscription.isCheckoutLoading}
    >
      <div className="app-page-cabinet py-8">
        <h1 className="mb-8 text-2xl font-black tracking-tight text-foreground">
          {createPlanContent.title}
        </h1>

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
            {plaidBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
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
            disabled={!cardsReady || createPlan.isPending}
            onClick={() => void onContinue()}
          >
            {createPlan.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {createPlanContent.continue}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full max-w-md font-semibold"
            onClick={() => navigate(returnTo)}
          >
            {createPlanContent.skip}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
