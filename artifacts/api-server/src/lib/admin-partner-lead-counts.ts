import { and, count, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { db, debtLeadsTable } from "@workspace/db";

export type PartnerLeadCounts = {
  onReview: number;
  inProgress: number;
  won: number;
  rejected: number;
};

function emptyCounts(): PartnerLeadCounts {
  return { onReview: 0, inProgress: 0, won: 0, rejected: 0 };
}

export async function fetchPartnerLeadCounts(partnerId: number): Promise<PartnerLeadCounts> {
  const partnerCond = eq(debtLeadsTable.partnerId, partnerId);

  const [[onReviewRow], [inProgressRow], [wonRow], [rejectedRow]] = await Promise.all([
    db
      .select({ value: count() })
      .from(debtLeadsTable)
      .where(
        and(
          partnerCond,
          eq(debtLeadsTable.status, "in_progress"),
          isNull(debtLeadsTable.partnerAcceptedAt),
        ),
      ),
    db
      .select({ value: count() })
      .from(debtLeadsTable)
      .where(
        and(
          partnerCond,
          eq(debtLeadsTable.status, "in_progress"),
          isNotNull(debtLeadsTable.partnerAcceptedAt),
        ),
      ),
    db
      .select({ value: count() })
      .from(debtLeadsTable)
      .where(and(partnerCond, eq(debtLeadsTable.status, "won"))),
    db
      .select({ value: count() })
      .from(debtLeadsTable)
      .where(and(partnerCond, eq(debtLeadsTable.status, "denied"))),
  ]);

  return {
    onReview: onReviewRow?.value ?? 0,
    inProgress: inProgressRow?.value ?? 0,
    won: wonRow?.value ?? 0,
    rejected: rejectedRow?.value ?? 0,
  };
}

export async function fetchPartnerLeadCountsMap(
  partnerIds: number[],
): Promise<Map<number, PartnerLeadCounts>> {
  const map = new Map<number, PartnerLeadCounts>();
  if (partnerIds.length === 0) {
    return map;
  }

  for (const id of partnerIds) {
    map.set(id, emptyCounts());
  }

  const rows = await db
    .select({
      partnerId: debtLeadsTable.partnerId,
      onReview: sql<number>`count(*) filter (where ${debtLeadsTable.status} = 'in_progress' and ${debtLeadsTable.partnerAcceptedAt} is null)::int`.mapWith(
        Number,
      ),
      inProgress: sql<number>`count(*) filter (where ${debtLeadsTable.status} = 'in_progress' and ${debtLeadsTable.partnerAcceptedAt} is not null)::int`.mapWith(
        Number,
      ),
      won: sql<number>`count(*) filter (where ${debtLeadsTable.status} = 'won')::int`.mapWith(Number),
      rejected: sql<number>`count(*) filter (where ${debtLeadsTable.status} = 'denied')::int`.mapWith(
        Number,
      ),
    })
    .from(debtLeadsTable)
    .where(inArray(debtLeadsTable.partnerId, partnerIds))
    .groupBy(debtLeadsTable.partnerId);

  for (const row of rows) {
    if (row.partnerId == null) continue;
    map.set(row.partnerId, {
      onReview: Number(row.onReview),
      inProgress: Number(row.inProgress),
      won: Number(row.won),
      rejected: Number(row.rejected),
    });
  }

  return map;
}
