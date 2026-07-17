import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  getGetDashboardTabQueryKey,
  getGetPartnersQueryOptions,
  getGetPlanLeadQueryKey,
  getGetPlanLeadQueryOptions,
  useDeletePlanLead,
  useGetPartners,
  useGetPlanLead,
  useSendPlanLead,
} from "@workspace/api-client-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardTab } from "@/components/dashboard/DashboardTabBar";
import { PlanLeadProgressView } from "@/components/dashboard/plan-lead/PlanLeadProgressView";
import { PlanLeadSendView } from "@/components/dashboard/plan-lead/PlanLeadSendView";
import { PlanLeadDeniedView } from "@/components/dashboard/plan-lead/PlanLeadDeniedView";
import { PlanLeadPartnerModalHost } from "@/components/dashboard/plan-lead/PlanLeadPartnerModalHost";
import { PlanSendSuccessModal } from "@/components/dashboard/plan-lead/PlanSendSuccessModal";
import { useAddPlanLeadCardsViaPlaid } from "@/components/dashboard/plan-lead/useAddPlanLeadCardsViaPlaid";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  planLeadPartnerCheckoutReturnPath,
  profileAuditCheckoutReturnPath,
} from "@/lib/audit-checkout-return";
import { dashboardTabPath } from "@/lib/dashboard-tab-url";
import {
  isPaymentRequiredError,
  updatePlanLeadCards,
} from "@/lib/payment-api";
import {
  parsePlanLeadIdFromPath,
  readPlanLeadAddCard,
  readPlanLeadPlanIndex,
  readPlanLeadReturnTo,
} from "@/lib/plan-lead-navigation";
import { useAuditReturnUrl } from "@/lib/use-audit-return-url";
import { useDashboardSubscription } from "@/lib/use-dashboard-subscription";
import { useCreatePlanViaPlaid } from "@/lib/use-create-plan-via-plaid";

export default function PlanLeadDetailPage() {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const search = typeof window !== "undefined" ? window.location.search : "";

  const onCheckoutCancel = useCallback(() => {
    toast({
      title: dashboardTabContent.checkout.cancelTitle,
      description: dashboardTabContent.checkout.cancelDescription,
    });
  }, []);

  const { auditSessionId, openPartnerPicker, setOpenPartnerPicker, clearAuditSession } =
    useAuditReturnUrl(onCheckoutCancel);

  const returnTo = useMemo(() => readPlanLeadReturnTo(search), [search]);

  const subscription = useDashboardSubscription(auditSessionId);
  const { startCreatePlan, isCreatingPlan } = useCreatePlanViaPlaid({ returnTo });

  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [sendSuccessOpen, setSendSuccessOpen] = useState(false);
  const plaidAutoStartRef = useRef(false);

  const planLeadId = useMemo(
    () => parsePlanLeadIdFromPath(location.split("?")[0] ?? ""),
    [location],
  );

  const planIndex = useMemo(() => readPlanLeadPlanIndex(search), [search]);
  const leadId = planLeadId ?? 0;
  const checkoutReturnPath =
    planLeadId != null
      ? planLeadPartnerCheckoutReturnPath(planLeadId, returnTo)
      : profileAuditCheckoutReturnPath();

  const onTabChange = useCallback(
    (tab: DashboardTab) => {
      navigate(dashboardTabPath(tab));
    },
    [navigate],
  );

  const detailQuery = useGetPlanLead(leadId, {
    query: {
      ...getGetPlanLeadQueryOptions(leadId),
      enabled: planLeadId != null,
    },
  });

  const partnersQuery = useGetPartners({
    query: {
      ...getGetPartnersQueryOptions(),
      enabled: detailQuery.data?.status === "recommended",
    },
  });

  const sendPlanLead = useSendPlanLead();
  const deletePlanLead = useDeletePlanLead();

  const onDeletePlan = async () => {
    if (!planLeadId) return;
    try {
      await deletePlanLead.mutateAsync({ id: planLeadId });
      await queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
      toast({
        title: planLeadDetailContent.deletePlanSuccessTitle,
        description: planLeadDetailContent.deletePlanSuccessDescription,
      });
      navigate(returnTo);
    } catch {
      toast({
        title: planLeadDetailContent.deletePlanErrorTitle,
        description: planLeadDetailContent.deletePlanErrorDescription,
        variant: "destructive",
      });
    }
  };

  const saveCardsMutation = useMutation({
    mutationFn: (cards: { brand: string; balance: number; rate: number; accountId?: string }[]) =>
      updatePlanLeadCards(leadId, cards),
    onSuccess: async () => {
      if (planLeadId) {
        await queryClient.invalidateQueries({
          queryKey: getGetPlanLeadQueryKey(planLeadId),
        });
      }
      await queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
    },
  });

  const clearAddCardFromUrl = useCallback(() => {
    const path = location.split("?")[0] ?? location;
    const params = new URLSearchParams(search);
    if (!params.has("addCard")) return;
    params.delete("addCard");
    const nextQuery = params.toString();
    navigate(nextQuery ? `${path}?${nextQuery}` : path, { replace: true });
  }, [location, navigate, search]);

  const { startPlaidAdd, isBusy: isAddingCard } = useAddPlanLeadCardsViaPlaid({
    planLeadId: leadId,
    existingCards: detailQuery.data?.cards ?? [],
    onSuccess: clearAddCardFromUrl,
  });

  useEffect(() => {
    if (plaidAutoStartRef.current) return;
    if (detailQuery.data?.status !== "recommended") return;
    if (!readPlanLeadAddCard(search)) return;
    plaidAutoStartRef.current = true;
    clearAddCardFromUrl();
    startPlaidAdd();
  }, [detailQuery.data?.status, search, clearAddCardFromUrl, startPlaidAdd]);

  useEffect(() => {
    if (auditSessionId && subscription.subscriptionActive) {
      clearAuditSession();
    }
  }, [auditSessionId, subscription.subscriptionActive, clearAuditSession]);

  useEffect(() => {
    if (openPartnerPicker && subscription.subscriptionActive) {
      setPartnerModalOpen(true);
      setOpenPartnerPicker(false);
    }
  }, [openPartnerPicker, subscription.subscriptionActive, setOpenPartnerPicker]);

  const doSend = async (partnerId: number) => {
    if (!planLeadId) return;
    await sendPlanLead.mutateAsync({ id: planLeadId, data: { partnerId } });
    await queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
    await queryClient.invalidateQueries({
      queryKey: getGetPlanLeadQueryKey(planLeadId),
    });
    setPartnerModalOpen(false);
    setSendSuccessOpen(true);
  };

  const onPartnerModalSend = async (partnerId: number) => {
    try {
      await doSend(partnerId);
    } catch (err: unknown) {
      if (isPaymentRequiredError(err)) {
        setPartnerModalOpen(false);
        return;
      }
      toast({
        title: planLeadDetailContent.sendErrorTitle,
        description: planLeadDetailContent.sendErrorDescription,
        variant: "destructive",
      });
    }
  };

  const onDeleteCard = (cardId: number) => {
    const detail = detailQuery.data;
    if (!detail) return;
    if (detail.cards.length <= 1) return;
    const remaining = detail.cards
      .filter((c) => c.id !== cardId)
      .map((c) => ({
        brand: c.brand,
        balance: c.balance,
        rate: c.currentApr,
      }));
    if (remaining.length === 0) return;
    void saveCardsMutation.mutateAsync(remaining).catch(() => {
      toast({
        title: "Could not update cards",
        variant: "destructive",
      });
    });
  };

  const shellProps = {
    activeTab: "dashboard" as const,
    onTabChange,
    subscriptionActive: subscription.subscriptionActive,
    startCheckout: subscription.startCheckout,
    isCheckoutLoading: subscription.isCheckoutLoading,
    activateReturnPath: checkoutReturnPath,
    onCreateSavingPlan: startCreatePlan,
    isCreatingPlan,
  };

  if (subscription.isSubscriptionLoading || detailQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  if (!planLeadId || detailQuery.isError || !detailQuery.data) {
    return (
      <DashboardShell {...shellProps}>
        <div className="app-page-cabinet max-w-none py-16 cabinet:max-w-none">
          <div className="dash-plan-detail-layout text-center">
            <p className="text-destructive">
              {planLeadId ? planLeadDetailContent.loadError : planLeadDetailContent.notFound}
            </p>
            <Button type="button" variant="outline" className="mt-4" asChild>
              <Link href={returnTo}>Back</Link>
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const detail = detailQuery.data;
  const partners = partnersQuery.data?.partners ?? [];

  return (
    <DashboardShell {...shellProps}>
      <div className="app-page-cabinet max-w-none py-6 cabinet:max-w-none bp600:py-8">
        <div className="dash-plan-detail-layout relative">
          {isAddingCard ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : null}

          {detail.status === "recommended" ? (
            <PlanLeadSendView
              detail={detail}
              planIndex={planIndex}
              returnTo={returnTo}
              isSavingCards={saveCardsMutation.isPending}
              isAddingCard={isAddingCard}
              isDeletingPlan={deletePlanLead.isPending}
              onDeleteCard={onDeleteCard}
              onDeletePlan={onDeletePlan}
              onAddCard={startPlaidAdd}
              onOpenPartnerModal={() => setPartnerModalOpen(true)}
            />
          ) : null}

          {detail.status === "in_progress" || detail.status === "won" ? (
            <PlanLeadProgressView
              detail={detail}
              planIndex={planIndex}
              returnTo={returnTo}
            />
          ) : null}

          {detail.status === "denied" ? (
            <PlanLeadDeniedView
              detail={detail}
              planIndex={planIndex}
              returnTo={returnTo}
            />
          ) : null}
        </div>
      </div>

      <PlanLeadPartnerModalHost
        open={partnerModalOpen}
        onOpenChange={setPartnerModalOpen}
        partners={partners}
        isSending={sendPlanLead.isPending}
        checkoutReturnPath={checkoutReturnPath}
        subscriptionActive={subscription.subscriptionActive}
        onSendActive={(partnerId) => void onPartnerModalSend(partnerId)}
      />
      <PlanSendSuccessModal open={sendSuccessOpen} onOpenChange={setSendSuccessOpen} />
    </DashboardShell>
  );
}
