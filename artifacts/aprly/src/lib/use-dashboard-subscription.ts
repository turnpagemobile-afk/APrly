import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardTabQueryKey,
  getGetDashboardTabQueryOptions,
} from "@workspace/api-client-react";
import { useAuditCheckout } from "@/lib/use-audit-checkout";

/**
 * Fresh Stripe-backed subscription state for the whole dashboard shell.
 * Refetches on mount so cabinet entry always reflects current subscription.
 */
/** @param auditSessionId Stripe session id from `?audit_session=` return URL after $39 payment */
export function useDashboardSubscription(auditSessionId: string | null = null) {
  const queryClient = useQueryClient();
  const invalidatedRef = useRef(false);

  useEffect(() => {
    if (invalidatedRef.current) return;
    invalidatedRef.current = true;
    void queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
  }, [queryClient]);

  const tabQuery = useQuery({
    ...getGetDashboardTabQueryOptions(),
    staleTime: 0,
    refetchOnMount: "always",
    retry: 1,
  });

  const { startCheckout, isCheckoutLoading, resumeFromReturnUrl } = useAuditCheckout();

  useEffect(() => {
    if (auditSessionId) {
      resumeFromReturnUrl(auditSessionId);
    }
  }, [auditSessionId, resumeFromReturnUrl]);

  const subscriptionActive = tabQuery.data?.subscriptionActive ?? false;
  const hasLeads = tabQuery.data?.hasLeads ?? false;
  const plans = tabQuery.data?.plans ?? [];
  const summary = tabQuery.data?.summary;
  const isSubscriptionLoading =
    (tabQuery.isPending || tabQuery.isLoading) && !tabQuery.data;

  return {
    subscriptionActive,
    hasLeads,
    plans,
    summary,
    isSubscriptionLoading,
    isSubscriptionError: tabQuery.isError,
    tabQuery,
    startCheckout,
    isCheckoutLoading,
    isPollingReturn: Boolean(auditSessionId),
  };
}
