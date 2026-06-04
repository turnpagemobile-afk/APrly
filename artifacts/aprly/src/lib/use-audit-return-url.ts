import { useEffect, useState } from "react";
import {
  readAuditCancel,
  readAuditSessionId,
  readOpenPartnerPicker,
  stripAuditCheckoutParamsFromUrl,
} from "@/lib/audit-checkout-return";

export function useAuditReturnUrl(onCheckoutCancel?: () => void) {
  const [auditSessionId, setAuditSessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return readAuditSessionId(window.location.search);
  });

  const [openPartnerPicker, setOpenPartnerPicker] = useState(() => {
    if (typeof window === "undefined") return false;
    return readOpenPartnerPicker(window.location.search);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const search = window.location.search;
    const sid = readAuditSessionId(search);
    const cancelled = readAuditCancel(search);
    const picker = readOpenPartnerPicker(search);

    if (sid) {
      setAuditSessionId(sid);
    }
    if (picker) {
      setOpenPartnerPicker(true);
    }
    if (sid || cancelled || picker) {
      stripAuditCheckoutParamsFromUrl();
    }
    if (cancelled) {
      onCheckoutCancel?.();
    }
  }, [onCheckoutCancel]);

  return {
    auditSessionId,
    openPartnerPicker,
    setOpenPartnerPicker,
    clearAuditSession: () => setAuditSessionId(null),
  };
}
