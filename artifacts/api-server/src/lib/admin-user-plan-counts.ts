import { and, count, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { db, debtLeadsTable } from "@workspace/db";

export type UserPlanCounts = {
  total: number;
  activePlans: number;
  sentToPartner: number;
  notSentPlans: number;
};

function emptyCounts(): UserPlanCounts {
  return { total: 0, activePlans: 0, sentToPartner: 0, notSentPlans: 0 };
}

/** Plans at a partner: on_review or in_progress (status in_progress + partner assigned). */
export function userActivePlansFilter(userId: number) {
  return and(
    eq(debtLeadsTable.userId, userId),
    eq(debtLeadsTable.status, "in_progress"),
    isNotNull(debtLeadsTable.partnerId),
  );
}

export function userNotSentPlansFilter(userId: number) {
  return and(eq(debtLeadsTable.userId, userId), isNull(debtLeadsTable.partnerId));
}

export async function fetchUserPlanCounts(userId: number): Promise<UserPlanCounts> {
  const userFilter = eq(debtLeadsTable.userId, userId);

  const [[totalRow], [activeRow], [sentRow], [notSentRow]] = await Promise.all([
    db.select({ value: count() }).from(debtLeadsTable).where(userFilter),
    db.select({ value: count() }).from(debtLeadsTable).where(userActivePlansFilter(userId)),
    db
      .select({ value: count() })
      .from(debtLeadsTable)
      .where(and(userFilter, isNotNull(debtLeadsTable.partnerId))),
    db.select({ value: count() }).from(debtLeadsTable).where(userNotSentPlansFilter(userId)),
  ]);

  return {
    total: totalRow?.value ?? 0,
    activePlans: activeRow?.value ?? 0,
    sentToPartner: sentRow?.value ?? 0,
    notSentPlans: notSentRow?.value ?? 0,
  };
}

export async function fetchUserPlanCountsMap(
  userIds: number[],
): Promise<Map<number, UserPlanCounts>> {
  const map = new Map<number, UserPlanCounts>();
  if (userIds.length === 0) {
    return map;
  }

  for (const id of userIds) {
    map.set(id, emptyCounts());
  }

  const rows = await db
    .select({
      userId: debtLeadsTable.userId,
      total: count(),
      activePlans: sql<number>`count(*) filter (where ${debtLeadsTable.status} = 'in_progress' and ${debtLeadsTable.partnerId} is not null)::int`.mapWith(
        Number,
      ),
      sentToPartner: sql<number>`count(*) filter (where ${debtLeadsTable.partnerId} is not null)::int`.mapWith(
        Number,
      ),
      notSentPlans: sql<number>`count(*) filter (where ${debtLeadsTable.partnerId} is null)::int`.mapWith(
        Number,
      ),
    })
    .from(debtLeadsTable)
    .where(inArray(debtLeadsTable.userId, userIds))
    .groupBy(debtLeadsTable.userId);

  for (const row of rows) {
    if (row.userId == null) continue;
    map.set(row.userId, {
      total: Number(row.total),
      activePlans: Number(row.activePlans),
      sentToPartner: Number(row.sentToPartner),
      notSentPlans: Number(row.notSentPlans),
    });
  }

  return map;
}
