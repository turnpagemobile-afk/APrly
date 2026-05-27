import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { AuditPaywallModal } from "@/components/dashboard/AuditPaywallModal";
import { AddCardsToPlanFlow } from "@/components/dashboard/plan-lead/AddCardsToPlanFlow";
import { PlanLeadProgressView } from "@/components/dashboard/plan-lead/PlanLeadProgressView";
import { PlanLeadSendView } from "@/components/dashboard/plan-lead/PlanLeadSendView";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  isPaymentRequiredError,
  updatePlanLeadCards,
} from "@/lib/payment-api";
import {
  parsePlanLeadIdFromPath,
  readPlanLeadAddCard,
  readPlanLeadReturnTo,
} from "@/lib/plan-lead-navigation";
import { useDashboardSubscription } from "@/lib/use-dashboard-subscription";

function readAuditSessionId(search: string): string | null {
  return new URLSearchParams(search).get("audit_session");
}

export default function PlanLeadDetailPage() {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const search =
    typeof window !== "undefined" ? window.location.search : "";
  const auditSessionId = useMemo(() => readAuditSessionId(search), [search]);
  const subscription = useDashboardSubscription(auditSessionId);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [pendingPartnerId, setPendingPartnerId] = useState<number | null>(null);
  const [addCardFlowOpen, setAddCardFlowOpen] = useState(false);

  const planLeadId = useMemo(
    () => parsePlanLeadIdFromPath(location.split("?")[0] ?? ""),
    [location],
  );

  const returnTo = useMemo(() => readPlanLeadReturnTo(search), [search]);

  const leadId = planLeadId ?? 0;

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
    navigate(returnTo);
  };

  const onSend = async (partnerId: number) => {
    if (!subscription.subscriptionActive) {
      setPendingPartnerId(partnerId);
      setPaywallOpen(true);
      return;
    }
    try {
      await doSend(partnerId);
    } catch (err: unknown) {
      if (isPaymentRequiredError(err)) {
        setPendingPartnerId(partnerId);
        setPaywallOpen(true);
        return;
      }
      toast({
        title: planLeadDetailContent.sendErrorTitle,
        description: planLeadDetailContent.sendErrorDescription,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!subscription.subscriptionActive || pendingPartnerId == null) {
      return;
    }
    const partnerId = pendingPartnerId;
    setPendingPartnerId(null);
    setPaywallOpen(false);
    void doSend(partnerId).catch((err: unknown) => {
      if (isPaymentRequiredError(err)) {
        setPendingPartnerId(partnerId);
        setPaywallOpen(true);
        return;
      }
      toast({
        title: planLeadDetailContent.sendErrorTitle,
        description: planLeadDetailContent.sendErrorDescription,
        variant: "destructive",
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resume once when payment unlocks
  }, [subscription.subscriptionActive, pendingPartnerId]);

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
      <DashboardShell
        activeTab="home"
        onTabChange={() => {}}
        showTabs={false}
        subscriptionActive={subscription.subscriptionActive}
        onActivateSubscription={() => void subscription.startCheckout()}
        isCheckoutLoading={subscription.isCheckoutLoading}
      >
        <div className="app-page-cabinet py-16 text-center">
          <p className="text-destructive">
            {planLeadId ? planLeadDetailContent.loadError : planLeadDetailContent.notFound}
          </p>
          <Button type="button" variant="outline" className="mt-4" asChild>
            <Link href={returnTo}>Back</Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const detail = detailQuery.data;

  return (
    <DashboardShell
      activeTab="home"
      onTabChange={() => {}}
      showTabs={false}
      subscriptionActive={subscription.subscriptionActive}
      onActivateSubscription={() => void subscription.startCheckout()}
      isCheckoutLoading={subscription.isCheckoutLoading}
    >
      <AuditPaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        onPay={() => void subscription.startCheckout()}
        isLoading={subscription.isCheckoutLoading}
      />

      <div className="app-page-cabinet py-6">
        <div className="mb-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 gap-2 font-semibold text-muted-foreground"
            asChild
          >
            <Link href={returnTo}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {planLeadDetailContent.backAriaLabel}
            </Link>
          </Button>
        </div>

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
            partners={partnersQuery.data?.partners ?? []}
            isSending={sendPlanLead.isPending}
            isSavingCards={saveCardsMutation.isPending}
            canSend={subscription.subscriptionActive}
            onSend={(partnerId) => void onSend(partnerId)}
            onRequirePayment={(partnerId) => {
              setPendingPartnerId(partnerId);
              setPaywallOpen(true);
            }}
            onDeleteCard={onDeleteCard}
            onAddCard={() => setAddCardFlowOpen(true)}
          />
        ) : null}

        {detail.status === "in_progress" || detail.status === "won" ? (
          <PlanLeadProgressView detail={detail} />
        ) : null}

        {detail.status === "denied" ? (
          <div className="space-y-4 text-center">
            <p className="text-lg font-bold text-foreground">
              {planLeadDetailContent.status.denied}
            </p>
            <p className="text-sm text-muted-foreground">
              {planLeadDetailContent.status.deniedDescription}
            </p>
            <Button type="button" variant="outline" asChild>
              <Link href={returnTo}>Back</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
