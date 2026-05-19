import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardTabQueryKey,
  getGetDashboardTabQueryOptions,
  getGetMeQueryKey,
  getMe,
} from "@workspace/api-client-react";
import { useSubscriptionRenewalCheckout } from "@/lib/use-subscription-renewal-checkout";

/**
 * Fresh Stripe-backed subscription state for the whole dashboard shell.
 * Refetches on mount so cabinet entry always reflects current subscription.
 */
export function useDashboardSubscription(stripeSessionId: string | null = null) {
  const queryClient = useQueryClient();
  const invalidatedRef = useRef(false);

  useEffect(() => {
    if (invalidatedRef.current) return;
    invalidatedRef.current = true;
    void queryClient.fetchQuery({
      queryKey: getGetMeQueryKey(),
      queryFn: ({ signal }) => getMe({ signal }),
    });
    void queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
  }, [queryClient]);

  const tabQuery = useQuery({
    ...getGetDashboardTabQueryOptions(),
    staleTime: 0,
    refetchOnMount: "always",
    retry: 1,
  });

  const checkout = useSubscriptionRenewalCheckout(stripeSessionId);

  const subscriptionActive = tabQuery.data?.subscriptionActive ?? false;
  const hasLeads = tabQuery.data?.hasLeads ?? false;
  const plans = tabQuery.data?.plans ?? [];
  const summary = tabQuery.data?.summary;
  const isSubscriptionLoading = tabQuery.isLoading && !tabQuery.data;

  return {
    subscriptionActive,
    hasLeads,
    plans,
    summary,
    isSubscriptionLoading,
    isSubscriptionError: tabQuery.isError,
    tabQuery,
    startCheckout: checkout.startCheckout,
    isCheckoutLoading: checkout.isCheckoutLoading,
    isPollingReturn: checkout.isPollingReturn,
  };
}
