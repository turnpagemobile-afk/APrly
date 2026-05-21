import type { DebtLead, LeadCard } from "@workspace/db";
import { buildHardshipPortal } from "./build-hardship-portal";
import { HARDSHIP_STEPS_TOTAL } from "./hardship-steps";
import { aggregateLeadCards } from "./lead-mapper";
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
  lead: DebtLead,
  cards: LeadCard[],
  user: User,
  partner: Partner | null,
) {
  const agg = aggregateLeadCards(cards);
  const displayStatus = resolveAdminUserPlanDisplayStatus({
    status: lead.status,
    partnerId: lead.partnerId,
    partnerAcceptedAt: lead.partnerAcceptedAt,
  });

  const showPortal =
    lead.partnerAcceptedAt != null &&
    lead.status === "in_progress" &&
    displayStatus === "in_progress";

  const hardshipPortal = showPortal
    ? buildHardshipPortal(lead.hardshipStepsCompleted)
    : lead.status === "won"
      ? buildHardshipPortal(HARDSHIP_STEPS_TOTAL)
      : undefined;

  const canStartWorking =
    lead.status === "in_progress" &&
    lead.partnerId != null &&
    lead.partnerAcceptedAt == null;

  const canCompleteStep =
    lead.status === "in_progress" &&
    lead.partnerAcceptedAt != null &&
    lead.hardshipStepsCompleted < HARDSHIP_STEPS_TOTAL;

  const canReject = lead.status === "in_progress" && lead.partnerId != null;

  return {
    id: lead.id,
    brand: agg.primaryBrand,
    balance: agg.totalBalance,
    currentApr: agg.weightedCurrentApr,
    targetApr: agg.targetApr,
    estimatedAnnualSavings: agg.totalEstimatedSavings,
    cardCount: agg.cardCount,
    status: lead.status,
    displayStatus,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    displayStatusChangedAt: lead.displayStatusChangedAt.toISOString(),
    sentToPartnerAt: lead.sentToPartnerAt?.toISOString() ?? null,
    partnerAcceptedAt: lead.partnerAcceptedAt?.toISOString() ?? null,
    hardshipStepsCompleted: lead.hardshipStepsCompleted,
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
  lead: DebtLead,
  cards: LeadCard[],
  partnerName?: string | null,
) {
  const agg = aggregateLeadCards(cards);
  const displayStatus = resolveAdminUserPlanDisplayStatus({
    status: lead.status,
    partnerId: lead.partnerId,
    partnerAcceptedAt: lead.partnerAcceptedAt,
  });

  return {
    id: lead.id,
    brand: agg.cardCount > 1 ? `${agg.primaryBrand} (+${agg.cardCount - 1})` : agg.primaryBrand,
    balance: agg.totalBalance,
    currentApr: agg.weightedCurrentApr,
    targetApr: agg.targetApr,
    estimatedAnnualSavings: agg.totalEstimatedSavings,
    cardCount: agg.cardCount,
    status: lead.status,
    displayStatus,
    partnerName: partnerName ?? null,
    hardshipPortal:
      displayStatus === "in_progress"
        ? buildHardshipPortal(lead.hardshipStepsCompleted)
        : undefined,
    createdAt: lead.createdAt.toISOString(),
  };
}

export type { AdminUserPlanDisplayStatus };
