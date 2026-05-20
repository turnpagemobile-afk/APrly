import type { PlanLeadStatus } from "@workspace/db";

export type AdminUserPlanDisplayStatus =
  | "not_sent"
  | "on_review"
  | "in_progress"
  | "won"
  | "rejected";

export type AprBadgeVariant = "solid" | "outlined";

export type AprDisplayVariants = {
  current: AprBadgeVariant;
  target: AprBadgeVariant;
};

type PlanLeadDisplayInput = {
  status: PlanLeadStatus;
  partnerId: number | null;
  partnerAcceptedAt: Date | null;
};

export function resolveAdminUserPlanDisplayStatus(
  row: PlanLeadDisplayInput,
): AdminUserPlanDisplayStatus {
  if (row.status === "recommended") return "not_sent";
  if (row.status === "won") return "won";
  if (row.status === "denied") return "rejected";
  if (row.status === "in_progress") {
    if (row.partnerId != null && row.partnerAcceptedAt == null) return "on_review";
    return "in_progress";
  }
  return "not_sent";
}

export function resolveAprDisplayVariants(
  displayStatus: AdminUserPlanDisplayStatus,
): AprDisplayVariants {
  switch (displayStatus) {
    case "on_review":
      return { current: "solid", target: "outlined" };
    case "in_progress":
      return { current: "solid", target: "solid" };
    case "won":
      return { current: "outlined", target: "solid" };
    case "not_sent":
    case "rejected":
    default:
      return { current: "solid", target: "outlined" };
  }
}

export function isPartnerVisibleLead(row: PlanLeadDisplayInput): boolean {
  return row.partnerId != null;
}
