import type { ImportCardItem } from "@workspace/api-client-react";
import type { CardEntry } from "@/components/landing/types";

export function mapCardEntriesToImportItems(accounts: CardEntry[]): ImportCardItem[] {
  return accounts
    .map((acc) => {
      const balance = parseFloat(acc.balance);
      const rate = parseFloat(acc.rate);
      if (Number.isNaN(balance) || Number.isNaN(rate) || balance <= 0 || rate <= 0) {
        return null;
      }
      const item: ImportCardItem = {
        brand: acc.brand.trim() || "Card",
        balance,
        rate,
      };
      if (acc.accountId) {
        item.accountId = acc.accountId;
        item.source = "plaid";
      } else {
        item.source = "manual";
      }
      return item;
    })
    .filter((x): x is ImportCardItem => x !== null);
}
