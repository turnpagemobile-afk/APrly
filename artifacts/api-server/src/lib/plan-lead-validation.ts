import type { DebtLead as PlanLeadRow, DebtLeadStatus as PlanLeadStatus } from "@workspace/db";

const SENT_STATUSES: PlanLeadStatus[] = ["in_progress", "won"];

export type ImportCardForPlanLead = {
  brand: string;
  balance: number;
  rate: number;
};

export function isValidImportCardForPlanLead(card: ImportCardForPlanLead): boolean {
  const brand = card.brand.trim();
  return (
    brand.length > 0 &&
    Number.isFinite(card.balance) &&
    card.balance > 0 &&
    Number.isFinite(card.rate) &&
    card.rate > 0 &&
    card.rate <= 100
  );
}

export function warnIfSentLeadMissingPartnerFields(
  row: Pick<PlanLeadRow, "id" | "status" | "partnerId" | "sentToPartnerAt">,
  partner: { id: number; name: string } | null,
): void {
  if (!SENT_STATUSES.includes(row.status)) return;

  if (!row.partnerId || !row.sentToPartnerAt || !partner) {
    console.warn(
      "[plan-lead] sent lead missing partner fields",
      JSON.stringify({
        debtLeadId: row.id,
        status: row.status,
        partnerId: row.partnerId,
        sentToPartnerAt: row.sentToPartnerAt?.toISOString() ?? null,
        hasPartner: Boolean(partner),
      }),
    );
  }
}
