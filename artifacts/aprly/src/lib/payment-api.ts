import { customFetch, ApiError } from "@workspace/api-client-react/custom-fetch";
import type { MeResponse } from "@workspace/api-client-react";
import type { PlanLeadDetail } from "@workspace/api-client-react";

export type RegisterInput = {
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  guestSessionId?: string;
};

export type AuditCheckoutPayload = {
  checkoutUrl: string;
  stripeSessionId: string;
};

export type AuditCheckoutSessionStatus = {
  status: "pending" | "processing" | "paid" | "expired";
  hasPaidAudit: boolean;
};

export async function registerAccount(
  data: RegisterInput,
  options?: RequestInit,
): Promise<MeResponse> {
  return customFetch<MeResponse>("/api/auth/register", {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(data),
  });
}

export type CreateAuditCheckoutInput = {
  returnPath?: string;
};

export async function createAuditCheckout(
  data?: CreateAuditCheckoutInput,
  options?: RequestInit,
): Promise<AuditCheckoutPayload> {
  return customFetch<AuditCheckoutPayload>("/api/me/audit-checkout", {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(data ?? {}),
  });
}

export async function getAuditCheckoutSessionStatus(
  stripeSessionId: string,
  options?: RequestInit,
): Promise<AuditCheckoutSessionStatus> {
  const q = new URLSearchParams({ stripeSessionId });
  return customFetch<AuditCheckoutSessionStatus>(
    `/api/me/audit-checkout/session-status?${q.toString()}`,
    { ...options, method: "GET" },
  );
}

export async function updatePlanLeadCards(
  planLeadId: number,
  cards: { brand: string; balance: number; rate: number; accountId?: string }[],
  options?: RequestInit,
): Promise<PlanLeadDetail> {
  return customFetch<PlanLeadDetail>(`/api/me/plan-leads/${planLeadId}/cards`, {
    ...options,
    method: "PUT",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify({ cards }),
  });
}

export function isPaymentRequiredError(err: unknown): boolean {
  if (!(err instanceof ApiError) || err.status !== 402) return false;
  const data = err.data;
  if (data == null || typeof data !== "object") return false;
  return (data as { code?: string }).code === "payment_required";
}
