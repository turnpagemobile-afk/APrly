import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  createAuditCheckout,
  getAuditCheckoutSessionStatus,
} from "@/lib/payment-api";
import { syncAuthSession } from "@/lib/auth-session";
import { getGetDashboardTabQueryKey } from "@workspace/api-client-react";
import { releaseDialogScrollLock } from "@/lib/release-dialog-scroll-lock";
import { DEFAULT_AUDIT_CHECKOUT_RETURN } from "@/lib/audit-checkout-return";

export type StartCheckoutOptions = {
  returnPath?: string;
};

export function useAuditCheckout() {
  const queryClient = useQueryClient();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const pollSession = useCallback(
    async (stripeSessionId: string): Promise<boolean> => {
      const data = await getAuditCheckoutSessionStatus(stripeSessionId);
      if (data.status === "paid" && data.hasPaidAudit) {
        await syncAuthSession(queryClient);
        await queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
        return true;
      }
      return false;
    },
    [queryClient],
  );

  const startCheckout = useCallback(async (options: StartCheckoutOptions = {}) => {
    setIsCheckoutLoading(true);
    try {
      const { checkoutUrl } = await createAuditCheckout({
        returnPath: options.returnPath ?? DEFAULT_AUDIT_CHECKOUT_RETURN,
      });
      releaseDialogScrollLock();
      window.location.assign(checkoutUrl);
    } finally {
      setIsCheckoutLoading(false);
    }
  }, []);

  const resumeFromReturnUrl = useCallback(
    (stripeSessionId: string | null) => {
      if (!stripeSessionId) return;
      stopPolling();
      pollRef.current = setInterval(() => {
        void pollSession(stripeSessionId).then((done) => {
          if (done) stopPolling();
        });
      }, 2000);
      void pollSession(stripeSessionId);
    },
    [pollSession, stopPolling],
  );

  return {
    isCheckoutLoading,
    startCheckout,
    resumeFromReturnUrl,
    stopPolling,
  };
}
