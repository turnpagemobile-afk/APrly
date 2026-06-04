export const DEFAULT_AUDIT_CHECKOUT_RETURN = "/dashboard?tab=dashboard";

export function profileAuditCheckoutReturnPath(): string {
  return "/dashboard/profile";
}

export function planLeadPartnerCheckoutReturnPath(planLeadId: number, returnTo: string): string {
  const params = new URLSearchParams({ openPartnerPicker: "1", returnTo });
  return `/dashboard/plan-leads/${planLeadId}?${params.toString()}`;
}

export function readOpenPartnerPicker(search: string): boolean {
  return new URLSearchParams(search).get("openPartnerPicker") === "1";
}

export function readAuditSessionId(search: string): string | null {
  return new URLSearchParams(search).get("audit_session");
}

export function readAuditCancel(search: string): boolean {
  return new URLSearchParams(search).get("audit_cancel") === "1";
}

/** Strip Stripe checkout query params while preserving other params (e.g. returnTo). */
export function stripAuditCheckoutParams(pathWithSearch: string): string {
  const [pathname, query = ""] = pathWithSearch.split("?");
  const params = new URLSearchParams(query);
  params.delete("audit_session");
  params.delete("audit_cancel");
  params.delete("openPartnerPicker");
  const next = params.toString();
  return next ? `${pathname}?${next}` : (pathname ?? pathWithSearch);
}

export function stripAuditCheckoutParamsFromUrl(): void {
  if (typeof window === "undefined") return;
  const next = stripAuditCheckoutParams(
    `${window.location.pathname}${window.location.search}`,
  );
  window.history.replaceState({}, "", next);
}
