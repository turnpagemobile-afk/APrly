import { and, count, eq, gt, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { db, debtLeadsTable } from "@workspace/db";

export type PartnerLeadCounts = {
  waiting: number;
  onReview: number;
  inProgress: number;
  won: number;
  rejected: number;
};

function emptyCounts(): PartnerLeadCounts {
  return { waiting: 0, onReview: 0, inProgress: 0, won: 0, rejected: 0 };
}

export async function fetchPartnerLeadCounts(partnerId: number): Promise<PartnerLeadCounts> {
  const partnerCond = eq(debtLeadsTable.partnerId, partnerId);

  const [[waitingRow], [onReviewRow], [inProgressRow], [wonRow], [rejectedRow]] = await Promise.all([
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
          eq(debtLeadsTable.hardshipStepsCompleted, 0),
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
          gt(debtLeadsTable.hardshipStepsCompleted, 0),
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
    waiting: waitingRow?.value ?? 0,
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
      waiting: sql<number>`count(*) filter (where ${debtLeadsTable.status} = 'in_progress' and ${debtLeadsTable.partnerAcceptedAt} is null)::int`.mapWith(
        Number,
      ),
      onReview: sql<number>`count(*) filter (where ${debtLeadsTable.status} = 'in_progress' and ${debtLeadsTable.partnerAcceptedAt} is not null and ${debtLeadsTable.hardshipStepsCompleted} = 0)::int`.mapWith(
        Number,
      ),
      inProgress: sql<number>`count(*) filter (where ${debtLeadsTable.status} = 'in_progress' and ${debtLeadsTable.partnerAcceptedAt} is not null and ${debtLeadsTable.hardshipStepsCompleted} > 0)::int`.mapWith(
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
      waiting: Number(row.waiting),
      onReview: Number(row.onReview),
      inProgress: Number(row.inProgress),
      won: Number(row.won),
      rejected: Number(row.rejected),
    });
  }

  return map;
}

/** Partners list columns: waiting + all accepted in-flight leads. */
export function partnerListLeadCounts(counts: PartnerLeadCounts): {
  onReviewCount: number;
  inProgressCount: number;
} {
  return {
    onReviewCount: counts.waiting,
    inProgressCount: counts.onReview + counts.inProgress,
  };
}
