import { Router, type IRouter } from "express";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  GetAdminUserParams,
  GetAdminUserPlansParams,
  GetAdminUserPlansQueryParams,
  GetAdminUserPlansResponse,
  GetAdminUserResponse,
  GetAdminUsersQueryParams,
  GetAdminUsersResponse,
} from "@workspace/api-zod";
import { db, debtLeadsTable, partnersTable, usersTable } from "@workspace/db";
import { mapAdminPlanLeadListRow } from "../lib/admin-plan-lead-mapper";
import { loadLeadCards } from "../lib/debt-lead-service";
import { USER_ROLE } from "../lib/user-roles";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

const subscribedCond = sql`coalesce(trim(${usersTable.stripeSubscriptionId}), '') <> ''`;

const levelExpr = sql<number>`(
  SELECT count(*)::int FROM ${debtLeadsTable}
  WHERE ${debtLeadsTable.userId} = ${usersTable.id}
    AND ${debtLeadsTable.status} = 'in_progress'
)`.mapWith(Number);

const planCountExpr = sql<number>`(
  SELECT count(*)::int FROM ${debtLeadsTable}
  WHERE ${debtLeadsTable.userId} = ${usersTable.id}
)`.mapWith(Number);

function monthsSince(createdAt: Date): number {
  const now = new Date();
  const months =
    (now.getFullYear() - createdAt.getFullYear()) * 12 +
    (now.getMonth() - createdAt.getMonth());
  return Math.max(0, months);
}

function hasSubscription(stripeSubscriptionId: string | null): boolean {
  return (stripeSubscriptionId ?? "").trim() !== "";
}

async function fetchUserRow(userId: number) {
  const [row] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      createdAt: usersTable.createdAt,
      stripeSubscriptionId: usersTable.stripeSubscriptionId,
      level: levelExpr,
      planCount: planCountExpr,
    })
    .from(usersTable)
    .where(and(eq(usersTable.id, userId), eq(usersTable.role, USER_ROLE)))
    .limit(1);
  return row;
}

router.get("/admin/users/:id/plans", ...requireAdmin, async (req, res, next) => {
  try {
    const paramsParsed = GetAdminUserPlansParams.safeParse({ id: req.params.id });
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }
    const userId = paramsParsed.data.id;

    const user = await fetchUserRow(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const queryParsed = GetAdminUserPlansQueryParams.safeParse(req.query);
    if (!queryParsed.success) {
      res.status(400).json({ error: "Invalid query" });
      return;
    }
    const { page, pageSize } = queryParsed.data;
    const offset = (page - 1) * pageSize;
    const listWhere = eq(debtLeadsTable.userId, userId);

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(debtLeadsTable)
      .where(listWhere);

    const rows = await db
      .select({
        lead: debtLeadsTable,
        partnerName: partnersTable.name,
      })
      .from(debtLeadsTable)
      .leftJoin(partnersTable, eq(debtLeadsTable.partnerId, partnersTable.id))
      .where(listWhere)
      .orderBy(desc(debtLeadsTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    const plans = await Promise.all(
      rows.map(async (r) => {
        const cards = await loadLeadCards(r.lead.id);
        return mapAdminPlanLeadListRow(r.lead, cards, r.partnerName);
      }),
    );

    res.json(
      GetAdminUserPlansResponse.parse({
        plans,
        total,
        page,
        pageSize,
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.get("/admin/users/:id", ...requireAdmin, async (req, res, next) => {
  try {
    const paramsParsed = GetAdminUserParams.safeParse({ id: req.params.id });
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }
    const userId = paramsParsed.data.id;

    const row = await fetchUserRow(userId);
    if (!row) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [{ value: currentPlansCount }] = await db
      .select({ value: count() })
      .from(debtLeadsTable)
      .where(
        and(eq(debtLeadsTable.userId, userId), eq(debtLeadsTable.status, "in_progress")),
      );

    const [{ value: createdPlansCount }] = await db
      .select({ value: count() })
      .from(debtLeadsTable)
      .where(eq(debtLeadsTable.userId, userId));

    res.json(
      GetAdminUserResponse.parse({
        user: {
          id: row.id,
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          level: row.level,
          planCount: row.planCount,
          createdAt: row.createdAt.toISOString(),
        },
        summary: {
          registeredMonthsAgo: monthsSince(row.createdAt),
          currentPlansCount,
          createdPlansCount,
        },
        subscription: {
          active: hasSubscription(row.stripeSubscriptionId),
          nextRenewalAt: null,
        },
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.get("/admin/users", ...requireAdmin, async (req, res, next) => {
  try {
    const parsed = GetAdminUsersQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query" });
      return;
    }

    const { tab, search, page, pageSize } = parsed.data;
    const q = search.trim();
    const offset = (page - 1) * pageSize;

    const roleFilter = eq(usersTable.role, USER_ROLE);
    const tabFilter = tab === "subscribed" ? subscribedCond : sql`NOT (${subscribedCond})`;

    const searchFilter = q
      ? or(
          ilike(usersTable.email, `%${q}%`),
          ilike(usersTable.firstName, `%${q}%`),
          ilike(usersTable.lastName, `%${q}%`),
        )
      : undefined;

    const listWhere = and(roleFilter, tabFilter, searchFilter);

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(usersTable)
      .where(listWhere);

    const [{ value: subscribed }] = await db
      .select({ value: count() })
      .from(usersTable)
      .where(and(roleFilter, subscribedCond));

    const [{ value: unsubscribed }] = await db
      .select({ value: count() })
      .from(usersTable)
      .where(and(roleFilter, sql`NOT (${subscribedCond})`));

    const rows = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        createdAt: usersTable.createdAt,
        level: levelExpr,
        planCount: planCountExpr,
      })
      .from(usersTable)
      .where(listWhere)
      .orderBy(desc(usersTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    res.json(
      GetAdminUsersResponse.parse({
        users: rows.map((r) => ({
          id: r.id,
          email: r.email,
          firstName: r.firstName,
          lastName: r.lastName,
          level: r.level,
          planCount: r.planCount,
          createdAt: r.createdAt.toISOString(),
        })),
        tabCounts: { subscribed, unsubscribed },
        total,
        page,
        pageSize,
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
