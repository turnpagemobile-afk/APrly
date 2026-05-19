import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardTabQueryKey,
  getGetMeQueryKey,
  getSubscriptionCheckoutSessionStatus,
  useCreateSubscriptionCheckout,
} from "@workspace/api-client-react";
import { toast } from "@/hooks/use-toast";
import { dashboardTabContent } from "@/content/dashboard-tab";

export function useSubscriptionRenewalCheckout(stripeSessionId: string | null) {
  const queryClient = useQueryClient();
  const checkoutMutation = useCreateSubscriptionCheckout();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const sessionQuery = useQuery({
    queryKey: ["subscription-checkout-session", stripeSessionId],
    queryFn: ({ signal }) =>
      getSubscriptionCheckoutSessionStatus(
        { stripeSessionId: stripeSessionId! },
        { signal },
      ),
    enabled: Boolean(stripeSessionId),
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (status === "paid" || status === "failed" || status === "expired") return false;
      return 2000;
    },
  });

  const syncedRef = useRef(false);

  useEffect(() => {
    const data = sessionQuery.data;
    if (!data || data.status !== "paid" || !data.subscriptionActive) return;
    if (syncedRef.current) return;
    syncedRef.current = true;

    void queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
    toast({
      title: dashboardTabContent.checkout.successTitle,
      description: dashboardTabContent.checkout.successDescription,
    });
  }, [sessionQuery.data, queryClient]);

  const startCheckout = useCallback(async () => {
    setIsRedirecting(true);
    try {
      const payload = await checkoutMutation.mutateAsync();
      window.location.assign(payload.checkoutUrl);
    } catch {
      setIsRedirecting(false);
      toast({
        title: dashboardTabContent.checkout.errorTitle,
        description: dashboardTabContent.checkout.errorDescription,
        variant: "destructive",
      });
    }
  }, [checkoutMutation]);

  const isCheckoutLoading =
    checkoutMutation.isPending || isRedirecting;

  const sessionStatus = sessionQuery.data?.status;
  const isPollingReturn =
    Boolean(stripeSessionId) &&
    (sessionQuery.isLoading ||
      sessionQuery.isFetching ||
      sessionStatus === "pending" ||
      sessionStatus === "processing");

  return {
    startCheckout,
    isCheckoutLoading,
    isPollingReturn,
    sessionQuery,
  };
}
