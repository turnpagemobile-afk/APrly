import { sql, eq, and, gte } from "drizzle-orm";
import { GetAdminDashboardSummaryResponse } from "@workspace/api-zod";

type AdminDashboardSummary = ReturnType<typeof GetAdminDashboardSummaryResponse.parse>;
import { db, usersTable } from "@workspace/db";
import { resolveSubscriptionActive } from "./subscription-status";
import { USER_ROLE } from "./user-roles";

type Period = "7d" | "30d" | "12m";

function periodDays(period: Period): number {
  if (period === "7d") return 7;
  if (period === "12m") return 365;
  return 30;
}

function mockRevenueTrends(): AdminDashboardSummary["revenueTrends"] {
  return [
    { label: "Last 7 days", value: "$8,345", changePercent: 4.3, changeDirection: "up" },
    { label: "Last 30 days", value: "$36,450", changePercent: 2.8, changeDirection: "up" },
    { label: "Last 12 months", value: "$1,216,345", changePercent: 0.5, changeDirection: "down" },
  ];
}

function mockChurnTrends(): AdminDashboardSummary["churnTrends"] {
  return [
    { label: "Last 7 days", value: "12 / 0.5%", changePercent: 0.5, changeDirection: "up" },
    { label: "Last 30 days", value: "35 / 1%", changePercent: 2.8, changeDirection: "down" },
    { label: "Last 12 months", value: "257 / 0.6%", changePercent: 3.1, changeDirection: "down" },
  ];
}

function mockMrrSeries(): AdminDashboardSummary["mrrSeries"] {
  return [
    { month: "Jan '26", value: 112000 },
    { month: "Feb '26", value: 118500 },
    { month: "Mar '26", value: 121200 },
    { month: "Apr '26", value: 125800 },
    { month: "May '26", value: 129400 },
    { month: "Jun '26", value: 132000 },
  ];
}

export async function buildAdminDashboardSummary(
  period: Period = "30d",
): Promise<AdminDashboardSummary> {
  const userRows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, USER_ROLE));

  let subscribed = 0;
  for (const row of userRows) {
    if (await resolveSubscriptionActive(row)) {
      subscribed += 1;
    }
  }

  const total = userRows.length;
  const unsubscribed = Math.max(0, total - subscribed);
  const subscribedPercent = total > 0 ? Math.round((subscribed / total) * 1000) / 10 : 0;
  const unsubscribedPercent = total > 0 ? Math.round((unsubscribed / total) * 1000) / 10 : 0;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - periodDays(period));

  const registrationRows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${usersTable.createdAt}), 'MM/DD/YY')`,
      count: sql<number>`count(*)::int`,
    })
    .from(usersTable)
    .where(and(eq(usersTable.role, USER_ROLE), gte(usersTable.createdAt, since)))
    .groupBy(sql`date_trunc('day', ${usersTable.createdAt})`)
    .orderBy(sql`date_trunc('day', ${usersTable.createdAt})`);

  return {
    users: {
      total,
      subscribed,
      unsubscribed,
      subscribedPercent,
      unsubscribedPercent,
    },
    newRegistrations: registrationRows.map((r) => ({
      date: r.date,
      count: Number(r.count),
    })),
    revenueTrends: mockRevenueTrends(),
    churnTrends: mockChurnTrends(),
    mrrSeries: mockMrrSeries(),
  };
}
