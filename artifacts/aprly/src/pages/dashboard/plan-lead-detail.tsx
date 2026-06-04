import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  getGetDashboardTabQueryKey,
  getGetPartnersQueryOptions,
  getGetPlanLeadQueryKey,
  getGetPlanLeadQueryOptions,
  useGetPartners,
  useGetPlanLead,
  useSendPlanLead,
} from "@workspace/api-client-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardTab } from "@/components/dashboard/DashboardTabBar";
import { AddCardsToPlanFlow } from "@/components/dashboard/plan-lead/AddCardsToPlanFlow";
import { PlanLeadProgressView } from "@/components/dashboard/plan-lead/PlanLeadProgressView";
import { PlanLeadSendView } from "@/components/dashboard/plan-lead/PlanLeadSendView";
import { PlanLeadDeniedView } from "@/components/dashboard/plan-lead/PlanLeadDeniedView";
import { PlanLeadPartnerModalHost } from "@/components/dashboard/plan-lead/PlanLeadPartnerModalHost";
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

  const subscription = useDashboardSubscription(auditSessionId);

  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [addCardFlowOpen, setAddCardFlowOpen] = useState(false);

  const planLeadId = useMemo(
    () => parsePlanLeadIdFromPath(location.split("?")[0] ?? ""),
    [location],
  );

  const returnTo = useMemo(() => readPlanLeadReturnTo(search), [search]);
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

  useEffect(() => {
    if (detailQuery.data?.status === "recommended" && readPlanLeadAddCard(search)) {
      setAddCardFlowOpen(true);
    }
  }, [detailQuery.data?.status, search]);

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
    toast({
      title: planLeadDetailContent.sendSuccessTitle,
      description: planLeadDetailContent.sendSuccessDescription,
    });
    setPartnerModalOpen(false);
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

  const closeAddCardFlow = () => {
    setAddCardFlowOpen(false);
    const path = location.split("?")[0] ?? location;
    const params = new URLSearchParams(search);
    params.delete("addCard");
    const nextQuery = params.toString();
    navigate(nextQuery ? `${path}?${nextQuery}` : path, { replace: true });
  };

  const shellProps = {
    activeTab: "dashboard" as const,
    onTabChange,
    subscriptionActive: subscription.subscriptionActive,
    startCheckout: subscription.startCheckout,
    isCheckoutLoading: subscription.isCheckoutLoading,
    activateReturnPath: checkoutReturnPath,
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
        <div className="dash-plan-detail-layout">
          {detail.status === "recommended" && addCardFlowOpen ? (
            <AddCardsToPlanFlow
              planLeadId={planLeadId}
              existingCards={detail.cards}
              onCancel={closeAddCardFlow}
            />
          ) : null}

          {detail.status === "recommended" && !addCardFlowOpen ? (
            <PlanLeadSendView
              detail={detail}
              planIndex={planIndex}
              returnTo={returnTo}
              isSavingCards={saveCardsMutation.isPending}
              onDeleteCard={onDeleteCard}
              onAddCard={() => setAddCardFlowOpen(true)}
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
    </DashboardShell>
  );
}
