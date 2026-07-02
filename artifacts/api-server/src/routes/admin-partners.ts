import { Router, type IRouter } from "express";
import { and, count, desc, eq, gt, ilike, isNotNull, isNull } from "drizzle-orm";
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
import { db, debtLeadsTable, partnersTable, usersTable } from "@workspace/db";
import {
  fetchPartnerLeadCounts,
  fetchPartnerLeadCountsMap,
  partnerListLeadCounts,
} from "../lib/admin-partner-lead-counts";
import { loadLeadCards } from "../lib/debt-lead-service";
import { mapAdminPartnerPlanLeadRow } from "../lib/admin-plan-lead-mapper";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

type LeadTab = "all" | "waiting" | "on_review" | "in_progress" | "won" | "rejected";

function leadTabFilter(partnerId: number, leadTab: LeadTab): SQL | undefined {
  const base = eq(debtLeadsTable.partnerId, partnerId);
  switch (leadTab) {
    case "waiting":
      return and(
        base,
        eq(debtLeadsTable.status, "in_progress"),
        isNull(debtLeadsTable.partnerAcceptedAt),
      );
    case "on_review":
      return and(
        base,
        eq(debtLeadsTable.status, "in_progress"),
        isNotNull(debtLeadsTable.partnerAcceptedAt),
        eq(debtLeadsTable.hardshipStepsCompleted, 0),
      );
    case "in_progress":
      return and(
        base,
        eq(debtLeadsTable.status, "in_progress"),
        isNotNull(debtLeadsTable.partnerAcceptedAt),
        gt(debtLeadsTable.hardshipStepsCompleted, 0),
      );
    case "all":
      return base;
    case "won":
      return and(base, eq(debtLeadsTable.status, "won"));
    case "rejected":
      return and(base, eq(debtLeadsTable.status, "denied"));
    default:
      return base;
  }
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

    const leadCounts = await fetchPartnerLeadCounts(partnerId);
    const where = leadTabFilter(partnerId, leadTab);

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(debtLeadsTable)
      .where(where);

    const rows = await db
      .select({
        lead: debtLeadsTable,
        userEmail: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
      })
      .from(debtLeadsTable)
      .innerJoin(usersTable, eq(debtLeadsTable.userId, usersTable.id))
      .where(where)
      .orderBy(desc(debtLeadsTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    const planLeads = await Promise.all(
      rows.map(async ({ lead, userEmail, firstName, lastName }) => {
        const cards = await loadLeadCards(lead.id);
        return mapAdminPartnerPlanLeadRow(lead, cards, {
          userId: lead.userId!,
          userEmail,
          firstName,
          lastName,
        });
      }),
    );

    res.json(
      GetAdminPartnerPlanLeadsResponse.parse({
        partner: {
          id: partner.id,
          name: partner.name,
          createdAt: partner.createdAt.toISOString(),
          isActive: partner.isActive,
        },
        leadCounts,
        planLeads,
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

    const counts = await fetchPartnerLeadCounts(id);
    const listCounts = partnerListLeadCounts(counts);

    res.json(
      PatchAdminPartnerResponse.parse({
        id: updated.id,
        name: updated.name,
        createdAt: updated.createdAt.toISOString(),
        isActive: updated.isActive,
        onReviewCount: listCounts.onReviewCount,
        inProgressCount: listCounts.inProgressCount,
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
      })
      .from(partnersTable)
      .where(listWhere)
      .orderBy(desc(partnersTable.id))
      .limit(pageSize)
      .offset(offset);

    const countsMap = await fetchPartnerLeadCountsMap(rows.map((r) => r.id));

    res.json(
      GetAdminPartnersResponse.parse({
        partners: rows.map((r) => {
          const counts = countsMap.get(r.id) ?? {
            waiting: 0,
            onReview: 0,
            inProgress: 0,
            won: 0,
            rejected: 0,
          };
          const listCounts = partnerListLeadCounts(counts);
          return {
            id: r.id,
            name: r.name,
            createdAt: r.createdAt.toISOString(),
            isActive: r.isActive,
            onReviewCount: listCounts.onReviewCount,
            inProgressCount: listCounts.inProgressCount,
          };
        }),
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
