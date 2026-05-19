import type { HardshipPortal } from "./build-hardship-portal";
import type { PlanLead as PlanLeadRow } from "@workspace/db";

type Partner = { id: number; name: string };

export function mapPlanLeadRow(row: PlanLeadRow) {
  return {
    id: row.id,
    brand: row.brand,
    balance: Number(row.balance),
    currentApr: Number(row.currentApr),
    targetApr: Number(row.targetApr),
    estimatedAnnualSavings: Number(row.estimatedAnnualSavings),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapPlanLeadDetail(
  row: PlanLeadRow,
  options?: {
    partner?: Partner | null;
    hardshipPortal?: HardshipPortal | null;
  },
) {
  return {
    ...mapPlanLeadRow(row),
    partnerId: row.partnerId ?? null,
    sentToPartnerAt: row.sentToPartnerAt?.toISOString() ?? null,
    partner: options?.partner ?? null,
    hardshipPortal: options?.hardshipPortal ?? null,
  };
}
