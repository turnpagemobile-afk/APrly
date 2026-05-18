import type { CardEntry } from "@/components/landing/types";

const STORAGE_KEY = "aprly_optimizer_snapshot";

export type OptimizerSnapshot = {
  name: string;
  email: string;
  accounts: CardEntry[];
  totalDebt: number;
  blendedRate?: number;
  dailyInterestWaste?: number;
  monthlySavings?: number;
  annualSavings?: number;
};

export function saveOptimizerSnapshot(snapshot: OptimizerSnapshot): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function loadOptimizerSnapshot(): OptimizerSnapshot | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OptimizerSnapshot;
    if (!parsed || typeof parsed.email !== "string" || !Array.isArray(parsed.accounts)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearOptimizerSnapshot(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export type ImportableCard = {
  brand: string;
  balance: number;
  rate: number;
  accountId?: string;
  source?: "manual" | "plaid";
};

export function snapshotCardsForImport(snapshot: OptimizerSnapshot): ImportableCard[] {
  const cards: ImportableCard[] = [];
  for (const account of snapshot.accounts) {
    const balance = parseFloat(account.balance);
    const rate = parseFloat(account.rate);
    if (Number.isNaN(balance) || Number.isNaN(rate) || balance <= 0 || rate <= 0) {
      continue;
    }
    const brand = account.brand.trim() || "Credit card";
    const row: ImportableCard = {
      brand,
      balance,
      rate,
      source: account.accountId ? "plaid" : "manual",
    };
    if (account.accountId) row.accountId = account.accountId;
    cards.push(row);
  }
  return cards;
}
