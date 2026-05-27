import type { DebtLead, LeadCard } from "@workspace/db";
import type { HardshipPortal } from "./build-hardship-portal";
import { warnIfSentLeadMissingPartnerFields } from "./plan-lead-validation";

type Partner = { id: number; name: string };

export function mapLeadCardRow(row: LeadCard) {
  return {
    id: row.id,
    brand: row.brand,
    balance: Number(row.balance),
    currentApr: Number(row.currentApr),
    targetApr: Number(row.targetApr),
    estimatedAnnualSavings: Number(row.estimatedAnnualSavings),
  };
}

export function aggregateLeadCards(cards: LeadCard[]) {
  const totalBalance = cards.reduce((sum, c) => sum + Number(c.balance), 0);
  const totalEstimatedSavings = cards.reduce(
    (sum, c) => sum + Number(c.estimatedAnnualSavings),
    0,
  );
  let weightedApr = 0;
  if (totalBalance > 0) {
    weightedApr =
      cards.reduce((sum, c) => sum + Number(c.balance) * Number(c.currentApr), 0) /
      totalBalance;
  }
  const primaryBrand = cards[0]?.brand ?? "Credit card";
  return {
    cardCount: cards.length,
    totalBalance: Math.round(totalBalance * 100) / 100,
    totalEstimatedSavings: Math.round(totalEstimatedSavings * 100) / 100,
    primaryBrand,
    weightedCurrentApr: Math.round(weightedApr * 1000) / 1000,
    targetApr: cards[0] ? Number(cards[0].targetApr) : 8,
  };
}

export function mapDebtLeadSummary(lead: DebtLead, cards: LeadCard[]) {
  const agg = aggregateLeadCards(cards);
  return {
    id: lead.id,
    status: lead.status,
    cardCount: agg.cardCount,
    totalBalance: agg.totalBalance,
    totalEstimatedSavings: agg.totalEstimatedSavings,
    primaryBrand: agg.primaryBrand,
    currentApr: agg.weightedCurrentApr,
    targetApr: agg.targetApr,
    createdAt: lead.createdAt.toISOString(),
  };
}

/** @deprecated Alias for OpenAPI PlanLead list compatibility */
export function mapPlanLeadRow(lead: DebtLead, cards: LeadCard[]) {
  const summary = mapDebtLeadSummary(lead, cards);
  return {
    id: summary.id,
    brand: summary.primaryBrand,
    balance: summary.totalBalance,
    currentApr: summary.currentApr,
    targetApr: summary.targetApr,
    estimatedAnnualSavings: summary.totalEstimatedSavings,
    status: summary.status,
    cardCount: summary.cardCount,
    cards: cards.map(mapLeadCardRow),
    createdAt: summary.createdAt,
  };
}

export function mapDebtLeadDetail(
  lead: DebtLead,
  cards: LeadCard[],
  options?: {
    partner?: Partner | null;
    hardshipPortal?: HardshipPortal | null;
  },
) {
  const summary = mapDebtLeadSummary(lead, cards);
  warnIfSentLeadMissingPartnerFields(lead, options?.partner ?? null);

  return {
    id: summary.id,
    status: summary.status,
    cardCount: summary.cardCount,
    brand: summary.primaryBrand,
    balance: summary.totalBalance,
    currentApr: summary.currentApr,
    targetApr: summary.targetApr,
    estimatedAnnualSavings: summary.totalEstimatedSavings,
    createdAt: summary.createdAt,
    cards: cards.map(mapLeadCardRow),
    partnerId: lead.partnerId ?? null,
    sentToPartnerAt: lead.sentToPartnerAt?.toISOString() ?? null,
    partner: options?.partner ?? null,
    hardshipPortal: options?.hardshipPortal ?? null,
  };
}

export function mapPlanLeadDetail(
  lead: DebtLead,
  cards: LeadCard[],
  options?: {
    partner?: Partner | null;
    hardshipPortal?: HardshipPortal | null;
  },
) {
  return mapDebtLeadDetail(lead, cards, options);
}
