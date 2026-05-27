import type { LeadCardItem } from "@workspace/api-client-react";

export type PlanLeadCardImport = {
  brand: string;
  balance: number;
  rate: number;
  accountId?: string;
};

export function mapLeadCardsToImport(cards: LeadCardItem[]): PlanLeadCardImport[] {
  return cards.map((c) => ({
    brand: c.brand,
    balance: c.balance,
    rate: c.currentApr,
  }));
}
