import { isValidImportCardForPlanLead } from "./plan-lead-validation";

export type UpsertGuestLeadCard = {
  brand: string;
  balance: number;
  rate: number;
  accountId?: string;
};

export type UpsertGuestLeadInput = {
  guestSessionId: string;
  name?: string;
  email?: string;
  cards: UpsertGuestLeadCard[];
};

export function parseUpsertGuestLeadBody(
  body: unknown,
): { ok: true; data: UpsertGuestLeadInput } | { ok: false } {
  if (!body || typeof body !== "object") return { ok: false };
  const raw = body as Record<string, unknown>;
  const guestSessionId =
    typeof raw.guestSessionId === "string" ? raw.guestSessionId.trim() : "";
  if (guestSessionId.length < 8 || guestSessionId.length > 64) return { ok: false };

  const name = typeof raw.name === "string" ? raw.name.trim() : undefined;
  const email = typeof raw.email === "string" ? raw.email.trim() : undefined;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false };

  if (!Array.isArray(raw.cards) || raw.cards.length < 1) return { ok: false };

  const cards: UpsertGuestLeadCard[] = [];
  for (const item of raw.cards) {
    if (!item || typeof item !== "object") return { ok: false };
    const row = item as Record<string, unknown>;
    const brand = typeof row.brand === "string" ? row.brand : "";
    const balance = typeof row.balance === "number" ? row.balance : NaN;
    const rate = typeof row.rate === "number" ? row.rate : NaN;
    const accountId =
      typeof row.accountId === "string" ? row.accountId : undefined;
    const card: UpsertGuestLeadCard = { brand, balance, rate, accountId };
    if (!isValidImportCardForPlanLead(card)) return { ok: false };
    cards.push(card);
  }

  return {
    ok: true,
    data: {
      guestSessionId,
      name: name || undefined,
      email: email || undefined,
      cards,
    },
  };
}
