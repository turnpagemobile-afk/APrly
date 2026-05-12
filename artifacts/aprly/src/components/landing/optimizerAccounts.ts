import type { CardEntry } from "./types";

export function parseAccountRows(
  accounts: CardEntry[],
): { balance: number; rate: number }[] {
  return accounts
    .map((a) => ({
      balance: parseFloat(a.balance),
      rate: parseFloat(a.rate),
    }))
    .filter(
      (x) =>
        !Number.isNaN(x.balance) &&
        !Number.isNaN(x.rate) &&
        x.balance > 0 &&
        x.rate > 0,
    );
}

export function aggregateCardBalances(accounts: CardEntry[]): {
  totalDebt: number;
  blendedRate: number;
} | null {
  const rows = parseAccountRows(accounts);
  if (!rows.length) return null;
  const totalDebt = rows.reduce((s, r) => s + r.balance, 0);
  const blendedRate =
    rows.reduce((s, r) => s + r.balance * r.rate, 0) / totalDebt;
  return { totalDebt, blendedRate };
}

export function accountsAreComplete(accounts: CardEntry[]): boolean {
  if (!accounts.length) return false;
  return accounts.every((a) => {
    const b = parseFloat(a.balance);
    const r = parseFloat(a.rate);
    return !Number.isNaN(b) && !Number.isNaN(r) && b > 0 && r > 0;
  });
}
