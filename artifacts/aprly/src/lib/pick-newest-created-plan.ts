import type { CreateDetailedPlanResponse, PlanLead } from "@workspace/api-client-react";

/** Newest plan from create response (plans sorted asc by createdAt on server). */
export function pickNewestCreatedPlan(
  response: CreateDetailedPlanResponse,
): PlanLead | null {
  if (response.createdCount < 1 || !response.plans.length) return null;
  return response.plans[response.plans.length - 1] ?? null;
}

export function visiblePlanIndex(plans: PlanLead[]): number {
  return plans.filter((p) => p.status !== "denied").length;
}
