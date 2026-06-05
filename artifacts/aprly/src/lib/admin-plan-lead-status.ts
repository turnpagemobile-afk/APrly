import type {
  AdminUserPlanDisplayStatus,
  PlanLeadStatus,
} from "@workspace/api-client-react";
import { adminContent } from "@/content/admin";

export function adminPlanDisplayStatusLabel(
  displayStatus: AdminUserPlanDisplayStatus,
): string {
  const copy = adminContent.userDetail.planDisplayStatus;
  switch (displayStatus) {
    case "not_sent":
      return copy.notSent;
    case "on_review":
      return copy.onReview;
    case "in_progress":
      return copy.inProgress;
    case "won":
      return copy.won;
    case "rejected":
      return copy.rejected;
    default:
      return displayStatus;
  }
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

export function adminPlanStatusBadgeClass(
  displayStatus: AdminUserPlanDisplayStatus,
): string {
  const visual = adminPlanVisualStatus(displayStatus);
  switch (visual) {
    case "recommended":
      return "dash-plan-status-badge dash-plan-status-badge--waiting";
    case "in_progress":
      return "dash-plan-status-badge dash-plan-status-badge--in-progress";
    case "won":
      return "dash-plan-status-badge dash-plan-status-badge--won";
    case "denied":
      return "rounded-full bg-[var(--danger-theme-100)] px-3 py-1 uppercase tracking-wide text-[var(--danger-theme-500)] dash-text-sm-sb";
    default:
      return "dash-plan-status-badge dash-plan-status-badge--waiting";
  }
}
