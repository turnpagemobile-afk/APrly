import type { CardEntry } from "@/components/landing/types";

/** Create Saving Plan: at least one card, all fields filled (name, balance, rate). */
export function createPlanCardsAreComplete(accounts: CardEntry[]): boolean {
  if (!accounts.length) return false;
  return accounts.every((a) => {
    const name = a.brand.trim();
    const balance = parseFloat(a.balance);
    const rate = parseFloat(a.rate);
    return (
      name.length > 0 &&
      !Number.isNaN(balance) &&
      !Number.isNaN(rate) &&
      balance > 0 &&
      rate > 0
    );
  });
}
