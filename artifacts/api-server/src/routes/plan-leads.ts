import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import {
  CreateDetailedPlanBody,
  CreateDetailedPlanResponse,
  GetPartnersResponse,
  GetPlanLeadResponse,
  SendPlanLeadBody,
  SendPlanLeadResponse,
  UpdatePlanLeadStatusBody,
  UpdatePlanLeadStatusResponse,
} from "@workspace/api-zod";
import { db, debtLeadsTable, partnersTable } from "@workspace/db";
import { requireAuth } from "../middleware/requireAuth";
import {
  createDetailedDebtLead,
  loadDebtLeadDetailForUser,
  loadDebtLeadForUser,
  loadLeadCards,
} from "../lib/debt-lead-service";
import { mapPlanLeadDetail, mapPlanLeadRow } from "../lib/lead-mapper";

const router: IRouter = Router();

router.get("/me/partners", requireAuth, async (req, res, next) => {
  try {
    const partners = await db
      .select({ id: partnersTable.id, name: partnersTable.name })
      .from(partnersTable)
      .orderBy(asc(partnersTable.name));

    res.json(GetPartnersResponse.parse({ partners }));
  } catch (err) {
    next(err);
  }
});

async function getLeadDetailHandler(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
) {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Invalid plan lead id" });
      return;
    }

    const detail = await loadDebtLeadDetailForUser(id, userId);
    if (!detail) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }

    res.json(GetPlanLeadResponse.parse(detail));
  } catch (err) {
    next(err);
  }
}

router.get("/me/plan-leads/:id", requireAuth, getLeadDetailHandler);
router.get("/me/leads/:id", requireAuth, getLeadDetailHandler);

async function sendLeadHandler(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
) {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Invalid plan lead id" });
      return;
    }

    const parsed = SendPlanLeadBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const loaded = await loadDebtLeadForUser(id, userId);
    if (!loaded) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }

    if (loaded.lead.status !== "recommended") {
      res.status(400).json({ error: "Plan lead is not eligible to send" });
      return;
    }

    if (loaded.cards.length === 0) {
      res.status(400).json({ error: "Plan lead has no cards" });
      return;
    }

    const [partner] = await db
      .select()
      .from(partnersTable)
      .where(eq(partnersTable.id, parsed.data.partnerId))
      .limit(1);

    if (!partner) {
      res.status(404).json({ error: "Partner not found" });
      return;
    }

    const sentAt = new Date();
    const [updated] = await db
      .update(debtLeadsTable)
      .set({
        partnerId: partner.id,
        sentToPartnerAt: sentAt,
        status: "in_progress",
        displayStatusChangedAt: sentAt,
        updatedAt: sentAt,
      })
      .where(eq(debtLeadsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }

    const cards = await loadLeadCards(id);
    res.json(
      SendPlanLeadResponse.parse(
        mapPlanLeadDetail(updated, cards, {
          partner: { id: partner.id, name: partner.name },
        }),
      ),
    );
  } catch (err) {
    next(err);
  }
}

router.post("/me/plan-leads/:id/send", requireAuth, sendLeadHandler);
router.post("/me/leads/:id/send", requireAuth, sendLeadHandler);

router.post("/me/detailed-plan", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const parsed = CreateDetailedPlanBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { createdCount, plans } = await createDetailedDebtLead(userId, parsed.data.cards);

    res.json(
      CreateDetailedPlanResponse.parse({
        createdCount,
        plans,
      }),
    );
  } catch (err) {
    next(err);
  }
});

const ALLOWED_TRANSITIONS: Record<string, Set<string>> = {
  recommended: new Set(),
  in_progress: new Set(["won", "denied"]),
  won: new Set(),
  denied: new Set(),
};

router.patch("/me/plan-leads/:id", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Invalid plan lead id" });
      return;
    }

    const parsed = UpdatePlanLeadStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const loaded = await loadDebtLeadForUser(id, userId);
    if (!loaded) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }

    const allowed = ALLOWED_TRANSITIONS[loaded.lead.status];
    if (!allowed?.has(parsed.data.status)) {
      res.status(400).json({ error: "Invalid status transition" });
      return;
    }

    const now = new Date();
    const [updated] = await db
      .update(debtLeadsTable)
      .set({
        status: parsed.data.status,
        displayStatusChangedAt: now,
        updatedAt: now,
      })
      .where(eq(debtLeadsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }

    const cards = await loadLeadCards(id);
    res.json(UpdatePlanLeadStatusResponse.parse(mapPlanLeadRow(updated, cards)));
  } catch (err) {
    next(err);
  }
});

export default router;
