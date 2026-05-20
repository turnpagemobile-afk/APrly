import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import {
  GetAdminPartnerPlanLeadParams,
  GetAdminUserPlanResponse,
  GetAdminUserPlanParams,
  PostAdminPlanLeadCompleteStepParams,
  PostAdminPlanLeadRejectParams,
  PostAdminPlanLeadStartWorkingParams,
} from "@workspace/api-zod";
import { db, partnersTable, planLeadsTable, usersTable } from "@workspace/db";
import { mapAdminPlanLeadDetail } from "../lib/admin-plan-lead-mapper";
import { buildPlanLeadPdfBuffer } from "../lib/plan-lead-pdf";
import { HARDSHIP_STEPS_TOTAL } from "../lib/hardship-steps";
import { USER_ROLE } from "../lib/user-roles";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

async function loadPlanLead(planId: number) {
  const [row] = await db
    .select()
    .from(planLeadsTable)
    .where(eq(planLeadsTable.id, planId))
    .limit(1);
  return row ?? null;
}

async function loadUser(userId: number) {
  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
    })
    .from(usersTable)
    .where(and(eq(usersTable.id, userId), eq(usersTable.role, USER_ROLE)))
    .limit(1);
  return user ?? null;
}

async function loadPartner(partnerId: number | null) {
  if (partnerId == null) return null;
  const [partner] = await db
    .select({ id: partnersTable.id, name: partnersTable.name })
    .from(partnersTable)
    .where(eq(partnersTable.id, partnerId))
    .limit(1);
  return partner ?? null;
}

async function buildDetailResponse(planId: number) {
  const row = await loadPlanLead(planId);
  if (!row) return null;
  const user = await loadUser(row.userId);
  if (!user) return null;
  const partner = await loadPartner(row.partnerId);
  return GetAdminUserPlanResponse.parse(
    mapAdminPlanLeadDetail(row, user, partner),
  );
}

router.get("/admin/users/:userId/plans/:planId", ...requireAdmin, async (req, res, next) => {
  try {
    const parsed = GetAdminUserPlanParams.safeParse({
      userId: req.params.userId,
      planId: req.params.planId,
    });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid ids" });
      return;
    }
    const { userId, planId } = parsed.data;
    const row = await loadPlanLead(planId);
    if (!row || row.userId !== userId) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    const detail = await buildDetailResponse(planId);
    if (!detail) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    res.json(detail);
  } catch (err) {
    next(err);
  }
});

router.get("/admin/partners/:partnerId/leads/:planId", ...requireAdmin, async (req, res, next) => {
  try {
    const parsed = GetAdminPartnerPlanLeadParams.safeParse({
      partnerId: req.params.partnerId,
      planId: req.params.planId,
    });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid ids" });
      return;
    }
    const { partnerId, planId } = parsed.data;
    const row = await loadPlanLead(planId);
    if (!row || row.partnerId !== partnerId) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    const detail = await buildDetailResponse(planId);
    if (!detail) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    res.json(detail);
  } catch (err) {
    next(err);
  }
});

router.get("/admin/plan-leads/:planId/pdf", ...requireAdmin, async (req, res, next) => {
  try {
    const planId = Number(req.params.planId);
    if (!Number.isInteger(planId) || planId < 1) {
      res.status(400).json({ error: "Invalid plan id" });
      return;
    }
    const row = await loadPlanLead(planId);
    if (!row) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    const user = await loadUser(row.userId);
    if (!user) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    const partner = await loadPartner(row.partnerId);
    const pdf = await buildPlanLeadPdfBuffer({ lead: row, user, partner });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="aprly-plan-lead-${planId}.pdf"`,
    );
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

router.post("/admin/plan-leads/:planId/start-working", ...requireAdmin, async (req, res, next) => {
  try {
    const parsed = PostAdminPlanLeadStartWorkingParams.safeParse({ planId: req.params.planId });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid plan id" });
      return;
    }
    const planId = parsed.data.planId;
    const row = await loadPlanLead(planId);
    if (!row) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    if (
      row.status !== "in_progress" ||
      row.partnerId == null ||
      row.partnerAcceptedAt != null
    ) {
      res.status(409).json({ error: "Cannot start working on this lead" });
      return;
    }

    const now = new Date();
    await db
      .update(planLeadsTable)
      .set({
        partnerAcceptedAt: now,
        hardshipStepsCompleted: 0,
        displayStatusChangedAt: now,
        updatedAt: now,
      })
      .where(eq(planLeadsTable.id, planId));

    const detail = await buildDetailResponse(planId);
    if (!detail) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    res.json(detail);
  } catch (err) {
    next(err);
  }
});

router.post("/admin/plan-leads/:planId/complete-step", ...requireAdmin, async (req, res, next) => {
  try {
    const parsed = PostAdminPlanLeadCompleteStepParams.safeParse({ planId: req.params.planId });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid plan id" });
      return;
    }
    const planId = parsed.data.planId;
    const row = await loadPlanLead(planId);
    if (!row) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    if (
      row.status !== "in_progress" ||
      row.partnerAcceptedAt == null ||
      row.hardshipStepsCompleted >= HARDSHIP_STEPS_TOTAL
    ) {
      res.status(409).json({ error: "Cannot complete step" });
      return;
    }

    const nextSteps = row.hardshipStepsCompleted + 1;
    const now = new Date();
    const updates =
      nextSteps >= HARDSHIP_STEPS_TOTAL
        ? {
            hardshipStepsCompleted: HARDSHIP_STEPS_TOTAL,
            status: "won" as const,
            displayStatusChangedAt: now,
            updatedAt: now,
          }
        : { hardshipStepsCompleted: nextSteps, updatedAt: now };

    await db.update(planLeadsTable).set(updates).where(eq(planLeadsTable.id, planId));

    const detail = await buildDetailResponse(planId);
    if (!detail) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    res.json(detail);
  } catch (err) {
    next(err);
  }
});

router.post("/admin/plan-leads/:planId/reject", ...requireAdmin, async (req, res, next) => {
  try {
    const parsed = PostAdminPlanLeadRejectParams.safeParse({ planId: req.params.planId });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid plan id" });
      return;
    }
    const planId = parsed.data.planId;
    const row = await loadPlanLead(planId);
    if (!row) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    if (row.status !== "in_progress" || row.partnerId == null) {
      res.status(409).json({ error: "Cannot reject this lead" });
      return;
    }

    const now = new Date();
    await db
      .update(planLeadsTable)
      .set({ status: "denied", displayStatusChangedAt: now, updatedAt: now })
      .where(eq(planLeadsTable.id, planId));

    const detail = await buildDetailResponse(planId);
    if (!detail) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }
    res.json(detail);
  } catch (err) {
    next(err);
  }
});

export default router;
