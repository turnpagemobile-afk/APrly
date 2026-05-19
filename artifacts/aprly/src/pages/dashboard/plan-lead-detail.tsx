import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
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
import { PlanLeadProgressView } from "@/components/dashboard/plan-lead/PlanLeadProgressView";
import { PlanLeadSendView } from "@/components/dashboard/plan-lead/PlanLeadSendView";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  parsePlanLeadIdFromPath,
  readPlanLeadReturnTo,
} from "@/lib/plan-lead-navigation";
import { useDashboardSubscription } from "@/lib/use-dashboard-subscription";

export default function PlanLeadDetailPage() {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const subscription = useDashboardSubscription(null);

  const planLeadId = useMemo(
    () => parsePlanLeadIdFromPath(location.split("?")[0] ?? ""),
    [location],
  );

  const returnTo = useMemo(
    () =>
      readPlanLeadReturnTo(
        typeof window !== "undefined" ? window.location.search : "",
      ),
    [],
  );

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

  const onSend = async (partnerId: number) => {
    if (!planLeadId) return;
    try {
      await sendPlanLead.mutateAsync({ id: planLeadId, data: { partnerId } });
      await queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
      if (planLeadId) {
        await queryClient.invalidateQueries({
          queryKey: getGetPlanLeadQueryKey(planLeadId),
        });
      }
      toast({
        title: planLeadDetailContent.sendSuccessTitle,
        description: planLeadDetailContent.sendSuccessDescription,
      });
      navigate(returnTo);
    } catch {
      toast({
        title: planLeadDetailContent.sendErrorTitle,
        description: planLeadDetailContent.sendErrorDescription,
        variant: "destructive",
      });
    }
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

        {detail.status === "recommended" ? (
          <PlanLeadSendView
            detail={detail}
            partners={partnersQuery.data?.partners ?? []}
            isSending={sendPlanLead.isPending}
            onSend={(partnerId) => void onSend(partnerId)}
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
