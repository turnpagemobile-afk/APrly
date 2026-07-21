import type {
  AdminUserPlanDisplayStatus,
  PlanLeadStatus,
} from "@workspace/api-client-react";
import { adminContent } from "@/content/admin";

export type AdminPlanBadgeContext = {
  displayStatus: AdminUserPlanDisplayStatus;
  hardshipPortal?: { progress: number } | null;
};

export type AdminUserPlanBadgeVariant =
  | "waiting"
  | "onReview"
  | "inProgress"
  | "won"
  | "reject"
  | "notSent";

export function adminUserPlanBadgeVariant(
  ctx: AdminPlanBadgeContext,
): AdminUserPlanBadgeVariant {
  const { displayStatus, hardshipPortal } = ctx;
  switch (displayStatus) {
    case "on_review":
      return "waiting";
    case "in_progress":
      return (hardshipPortal?.progress ?? 0) > 0 ? "inProgress" : "onReview";
    case "won":
      return "won";
    case "rejected":
      return "reject";
    case "not_sent":
    default:
      return "notSent";
  }
}

function badgeClassSuffix(variant: AdminUserPlanBadgeVariant): string {
  switch (variant) {
    case "onReview":
      return "on-review";
    case "inProgress":
      return "in-progress";
    case "notSent":
      return "not-sent";
    default:
      return variant;
  }
}

export function adminUserPlanDisplayStatusLabel(ctx: AdminPlanBadgeContext): string {
  const copy = adminContent.userDetail.planDisplayStatus;
  switch (adminUserPlanBadgeVariant(ctx)) {
    case "waiting":
      return copy.waiting;
    case "onReview":
      return copy.onReview;
    case "inProgress":
      return copy.inProgress;
    case "won":
      return copy.won;
    case "reject":
      return copy.rejected;
    case "notSent":
    default:
      return copy.notSent;
  }
}

export function adminUserPlanStatusBadgeClass(ctx: AdminPlanBadgeContext): string {
  const variant = adminUserPlanBadgeVariant(ctx);
  return `admin-user-plan-status-badge admin-user-plan-status-badge--${badgeClassSuffix(variant)}`;
}

export function adminPlanDetailMetricTileClass(ctx: AdminPlanBadgeContext): string {
  const variant = adminUserPlanBadgeVariant(ctx);
  const suffix = badgeClassSuffix(variant);
  return `dash-plan-detail-metric-tile admin-plan-detail-metric-tile admin-plan-detail-metric-tile--${suffix}`;
}

export function adminPlanDetailStatusValueClass(ctx: AdminPlanBadgeContext): string {
  switch (adminUserPlanBadgeVariant(ctx)) {
    case "waiting":
      return "text-[var(--neutral-theme-500)]";
    case "onReview":
      return "text-[var(--warning-theme-700)]";
    case "inProgress":
      return "text-[var(--info-theme-500)]";
    case "won":
      return "text-[var(--success-theme-500)]";
    case "reject":
      return "text-[var(--danger-theme-500)]";
    case "notSent":
    default:
      return "text-[var(--neutral-theme-500)]";
  }
}

/** @deprecated Prefer adminUserPlanDisplayStatusLabel with hardshipPortal context. */
export function adminPlanDisplayStatusLabel(
  displayStatus: AdminUserPlanDisplayStatus,
  hardshipPortal?: { progress: number } | null,
): string {
  return adminUserPlanDisplayStatusLabel({ displayStatus, hardshipPortal });
}

export function adminPlanVisualStatus(
  displayStatus: AdminUserPlanDisplayStatus,
): PlanLeadStatus {
  switch (displayStatus) {
    case "not_sent":
      return "recommended";
    case "on_review":
    case "in_progress":
      return "in_progress";
    case "won":
      return "won";
    case "rejected":
      return "denied";
    default:
      return "recommended";
  }
}

/** @deprecated Prefer adminUserPlanStatusBadgeClass with hardshipPortal context. */
export function adminPlanStatusBadgeClass(
  displayStatus: AdminUserPlanDisplayStatus,
  hardshipPortal?: { progress: number } | null,
): string {
  return adminUserPlanStatusBadgeClass({ displayStatus, hardshipPortal });
}
