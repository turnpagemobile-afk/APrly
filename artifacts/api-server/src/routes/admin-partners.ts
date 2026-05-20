import { Router, type IRouter } from "express";
import { and, asc, count, desc, eq, ilike, isNotNull, isNull, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import {
  GetAdminPartnerPlanLeadsParams,
  GetAdminPartnerPlanLeadsQueryParams,
  GetAdminPartnerPlanLeadsResponse,
  GetAdminPartnersQueryParams,
  GetAdminPartnersResponse,
  PatchAdminPartnerBody,
  PatchAdminPartnerParams,
  PatchAdminPartnerResponse,
  PostAdminPartnerBody,
} from "@workspace/api-zod";
import { db, partnersTable, planLeadsTable, usersTable } from "@workspace/db";
import { resolveAdminUserPlanDisplayStatus } from "../lib/plan-lead-display-status";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

type LeadTab = "all" | "on_review" | "in_progress" | "won" | "rejected";

function onReviewCountExpr() {
  return sql<number>`(
    SELECT count(*)::int FROM ${planLeadsTable}
    WHERE ${planLeadsTable.partnerId} = ${partnersTable.id}
      AND ${planLeadsTable.status} = 'in_progress'
      AND ${planLeadsTable.partnerAcceptedAt} IS NULL
  )`.mapWith(Number);
}

function inProgressCountExpr() {
  return sql<number>`(
    SELECT count(*)::int FROM ${planLeadsTable}
    WHERE ${planLeadsTable.partnerId} = ${partnersTable.id}
      AND ${planLeadsTable.status} = 'in_progress'
      AND ${planLeadsTable.partnerAcceptedAt} IS NOT NULL
  )`.mapWith(Number);
}

function leadTabFilter(partnerId: number, leadTab: LeadTab): SQL | undefined {
  const base = eq(planLeadsTable.partnerId, partnerId);
  switch (leadTab) {
    case "on_review":
      return and(
        base,
        eq(planLeadsTable.status, "in_progress"),
        isNull(planLeadsTable.partnerAcceptedAt),
      );
    case "in_progress":
      return and(
        base,
        eq(planLeadsTable.status, "in_progress"),
        isNotNull(planLeadsTable.partnerAcceptedAt),
      );
    case "all":
      return base;
    case "won":
      return and(base, eq(planLeadsTable.status, "won"));
    case "rejected":
      return and(base, eq(planLeadsTable.status, "denied"));
    default:
      return base;
  }
}

async function fetchLeadCounts(partnerId: number) {
  const partnerCond = eq(planLeadsTable.partnerId, partnerId);

  const [{ value: onReview }] = await db
    .select({ value: count() })
    .from(planLeadsTable)
    .where(
      and(
        partnerCond,
        eq(planLeadsTable.status, "in_progress"),
        isNull(planLeadsTable.partnerAcceptedAt),
      ),
    );

  const [{ value: inProgress }] = await db
    .select({ value: count() })
    .from(planLeadsTable)
    .where(
      and(
        partnerCond,
        eq(planLeadsTable.status, "in_progress"),
        isNotNull(planLeadsTable.partnerAcceptedAt),
      ),
    );

  const [{ value: won }] = await db
    .select({ value: count() })
    .from(planLeadsTable)
    .where(and(partnerCond, eq(planLeadsTable.status, "won")));

  const [{ value: rejected }] = await db
    .select({ value: count() })
    .from(planLeadsTable)
    .where(and(partnerCond, eq(planLeadsTable.status, "denied")));

  return { onReview, inProgress, won, rejected };
}

router.get("/admin/partners/:id/plan-leads", ...requireAdmin, async (req, res, next) => {
  try {
    const paramsParsed = GetAdminPartnerPlanLeadsParams.safeParse({ id: req.params.id });
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid partner id" });
      return;
    }
    const partnerId = paramsParsed.data.id;

    const queryParsed = GetAdminPartnerPlanLeadsQueryParams.safeParse(req.query);
    if (!queryParsed.success) {
      res.status(400).json({ error: "Invalid query" });
      return;
    }
    const { leadTab, page, pageSize } = queryParsed.data;
    const offset = (page - 1) * pageSize;

    const [partner] = await db
      .select({
        id: partnersTable.id,
        name: partnersTable.name,
        createdAt: partnersTable.createdAt,
        isActive: partnersTable.isActive,
      })
      .from(partnersTable)
      .where(eq(partnersTable.id, partnerId))
      .limit(1);

    if (!partner) {
      res.status(404).json({ error: "Partner not found" });
      return;
    }

    const leadCounts = await fetchLeadCounts(partnerId);
    const where = leadTabFilter(partnerId, leadTab);

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(planLeadsTable)
      .where(where);

    const rows = await db
      .select({
        lead: planLeadsTable,
        userEmail: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
      })
      .from(planLeadsTable)
      .innerJoin(usersTable, eq(planLeadsTable.userId, usersTable.id))
      .where(where)
      .orderBy(desc(planLeadsTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    res.json(
      GetAdminPartnerPlanLeadsResponse.parse({
        partner: {
          id: partner.id,
          name: partner.name,
          createdAt: partner.createdAt.toISOString(),
          isActive: partner.isActive,
        },
        leadCounts,
        planLeads: rows.map(({ lead, userEmail, firstName, lastName }) => ({
          id: lead.id,
          userId: lead.userId,
          brand: lead.brand,
          balance: Number(lead.balance),
          currentApr: Number(lead.currentApr),
          targetApr: Number(lead.targetApr),
          estimatedAnnualSavings: Number(lead.estimatedAnnualSavings),
          status: lead.status,
          displayStatus: resolveAdminUserPlanDisplayStatus({
            status: lead.status,
            partnerId: lead.partnerId,
            partnerAcceptedAt: lead.partnerAcceptedAt,
          }),
          userEmail,
          firstName,
          lastName,
          sentToPartnerAt: lead.sentToPartnerAt?.toISOString() ?? null,
          createdAt: lead.createdAt.toISOString(),
        })),
        total,
        page,
        pageSize,
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/partners/:id", ...requireAdmin, async (req, res, next) => {
  try {
    const paramsParsed = PatchAdminPartnerParams.safeParse({ id: req.params.id });
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid partner id" });
      return;
    }
    const id = paramsParsed.data.id;

    const bodyParsed = PatchAdminPartnerBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const body = bodyParsed.data;
    if (body.name === undefined && body.isActive === undefined) {
      res.status(400).json({ error: "At least one of name, isActive is required" });
      return;
    }

    const updates: { name?: string; isActive?: boolean } = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    const [updated] = await db
      .update(partnersTable)
      .set(updates)
      .where(eq(partnersTable.id, id))
      .returning({
        id: partnersTable.id,
        name: partnersTable.name,
        createdAt: partnersTable.createdAt,
        isActive: partnersTable.isActive,
      });

    if (!updated) {
      res.status(404).json({ error: "Partner not found" });
      return;
    }

    const [{ onReviewCount, inProgressCount }] = await db
      .select({
        onReviewCount: onReviewCountExpr(),
        inProgressCount: inProgressCountExpr(),
      })
      .from(partnersTable)
      .where(eq(partnersTable.id, id));

    res.json(
      PatchAdminPartnerResponse.parse({
        id: updated.id,
        name: updated.name,
        createdAt: updated.createdAt.toISOString(),
        isActive: updated.isActive,
        onReviewCount,
        inProgressCount,
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/partners/:id", ...requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Invalid partner id" });
      return;
    }

    const deleted = await db.delete(partnersTable).where(eq(partnersTable.id, id)).returning({ id: partnersTable.id });
    if (deleted.length === 0) {
      res.status(404).json({ error: "Partner not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get("/admin/partners", ...requireAdmin, async (req, res, next) => {
  try {
    const parsed = GetAdminPartnersQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query" });
      return;
    }
    const { search, page, pageSize } = parsed.data;
    const q = search.trim();
    const offset = (page - 1) * pageSize;

    const searchFilter = q ? ilike(partnersTable.name, `%${q}%`) : undefined;
    const listWhere = searchFilter;

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(partnersTable)
      .where(listWhere);

    const rows = await db
      .select({
        id: partnersTable.id,
        name: partnersTable.name,
        createdAt: partnersTable.createdAt,
        isActive: partnersTable.isActive,
        onReviewCount: onReviewCountExpr(),
        inProgressCount: inProgressCountExpr(),
      })
      .from(partnersTable)
      .where(listWhere)
      .orderBy(desc(partnersTable.id))
      .limit(pageSize)
      .offset(offset);

    res.json(
      GetAdminPartnersResponse.parse({
        partners: rows.map((r) => ({
          id: r.id,
          name: r.name,
          createdAt: r.createdAt.toISOString(),
          isActive: r.isActive,
          onReviewCount: r.onReviewCount,
          inProgressCount: r.inProgressCount,
        })),
        total,
        page,
        pageSize,
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.post("/admin/partners", ...requireAdmin, async (req, res, next) => {
  try {
    const parsed = PostAdminPartnerBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const name = parsed.data.name.trim();
    if (!name) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    let inserted;
    try {
      [inserted] = await db
        .insert(partnersTable)
        .values({ name, isActive: true })
        .returning({
          id: partnersTable.id,
          name: partnersTable.name,
          createdAt: partnersTable.createdAt,
          isActive: partnersTable.isActive,
        });
    } catch (e: unknown) {
      const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";
      if (code === "23505") {
        res.status(409).json({ error: "Partner name already exists" });
        return;
      }
      throw e;
    }

    if (!inserted) {
      res.status(500).json({ error: "Insert failed" });
      return;
    }

    res.status(201).json(
      PatchAdminPartnerResponse.parse({
        id: inserted.id,
        name: inserted.name,
        createdAt: inserted.createdAt.toISOString(),
        isActive: inserted.isActive,
        onReviewCount: 0,
        inProgressCount: 0,
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
