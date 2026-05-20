import type { PlanLead } from "@workspace/db";
import { buildHardshipPortal } from "./build-hardship-portal";
import { HARDSHIP_STEPS_TOTAL } from "./hardship-steps";
import {
  resolveAdminUserPlanDisplayStatus,
  type AdminUserPlanDisplayStatus,
} from "./plan-lead-display-status";

type Partner = { id: number; name: string };
type User = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export function mapAdminPlanLeadDetail(
  row: PlanLead,
  user: User,
  partner: Partner | null,
) {
  const displayStatus = resolveAdminUserPlanDisplayStatus({
    status: row.status,
    partnerId: row.partnerId,
    partnerAcceptedAt: row.partnerAcceptedAt,
  });

  const showPortal =
    row.partnerAcceptedAt != null &&
    row.status === "in_progress" &&
    displayStatus === "in_progress";

  const hardshipPortal = showPortal
    ? buildHardshipPortal(row.hardshipStepsCompleted)
    : row.status === "won"
      ? buildHardshipPortal(HARDSHIP_STEPS_TOTAL)
      : undefined;

  const canStartWorking =
    row.status === "in_progress" &&
    row.partnerId != null &&
    row.partnerAcceptedAt == null;

  const canCompleteStep =
    row.status === "in_progress" &&
    row.partnerAcceptedAt != null &&
    row.hardshipStepsCompleted < HARDSHIP_STEPS_TOTAL;

  const canReject =
    row.status === "in_progress" && row.partnerId != null;

  return {
    id: row.id,
    brand: row.brand,
    balance: Number(row.balance),
    currentApr: Number(row.currentApr),
    targetApr: Number(row.targetApr),
    estimatedAnnualSavings: Number(row.estimatedAnnualSavings),
    status: row.status,
    displayStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    displayStatusChangedAt: row.displayStatusChangedAt.toISOString(),
    sentToPartnerAt: row.sentToPartnerAt?.toISOString() ?? null,
    partnerAcceptedAt: row.partnerAcceptedAt?.toISOString() ?? null,
    hardshipStepsCompleted: row.hardshipStepsCompleted,
    hardshipStepsTotal: HARDSHIP_STEPS_TOTAL,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    partner,
    hardshipPortal,
    canStartWorking,
    canCompleteStep,
    canReject,
  };
}

export function mapAdminPlanLeadListRow(
  row: PlanLead & { partnerName?: string | null },
) {
  const displayStatus = resolveAdminUserPlanDisplayStatus({
    status: row.status,
    partnerId: row.partnerId,
    partnerAcceptedAt: row.partnerAcceptedAt,
  });

  return {
    id: row.id,
    brand: row.brand,
    balance: Number(row.balance),
    currentApr: Number(row.currentApr),
    targetApr: Number(row.targetApr),
    estimatedAnnualSavings: Number(row.estimatedAnnualSavings),
    status: row.status,
    displayStatus,
    partnerName: row.partnerName ?? null,
    hardshipPortal:
      displayStatus === "in_progress"
        ? buildHardshipPortal(row.hardshipStepsCompleted)
        : undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export type { AdminUserPlanDisplayStatus };
