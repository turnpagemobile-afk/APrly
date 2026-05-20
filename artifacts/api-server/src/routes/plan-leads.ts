import { Router, type IRouter } from "express";
import { and, asc, eq, isNull } from "drizzle-orm";
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
import { db, partnersTable, planLeadsTable, userCardsTable } from "@workspace/db";
import { requireAuth } from "../middleware/requireAuth";
import { CABINET_TARGET_APR, calculateAnnualSavings } from "../lib/optimizer-math";
import { buildHardshipPortal } from "../lib/build-hardship-portal";
import { mapPlanLeadDetail, mapPlanLeadRow } from "../lib/plan-lead-mapper";
import { isValidImportCardForPlanLead } from "../lib/plan-lead-validation";

const router: IRouter = Router();

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function findExistingPlanLead(
  tx: DbTx,
  userId: number,
  userCardId: number | null,
  plaidAccountId: string | null,
  brand: string,
  balance: string,
  currentApr: string,
) {
  if (plaidAccountId) {
    const [byPlaid] = await tx
      .select()
      .from(planLeadsTable)
      .where(
        and(
          eq(planLeadsTable.userId, userId),
          eq(planLeadsTable.plaidAccountId, plaidAccountId),
        ),
      )
      .limit(1);
    if (byPlaid) return byPlaid;
  }

  if (userCardId) {
    const [byCard] = await tx
      .select()
      .from(planLeadsTable)
      .where(
        and(eq(planLeadsTable.userId, userId), eq(planLeadsTable.userCardId, userCardId)),
      )
      .limit(1);
    if (byCard) return byCard;
  }

  const [bySnapshot] = await tx
    .select()
    .from(planLeadsTable)
    .where(
      and(
        eq(planLeadsTable.userId, userId),
        eq(planLeadsTable.brand, brand),
        eq(planLeadsTable.balance, balance),
        eq(planLeadsTable.currentApr, currentApr),
        isNull(planLeadsTable.plaidAccountId),
      ),
    )
    .limit(1);

  return bySnapshot ?? null;
}

async function loadPlanLeadDetail(userId: number, id: number) {
  const [row] = await db
    .select()
    .from(planLeadsTable)
    .where(and(eq(planLeadsTable.id, id), eq(planLeadsTable.userId, userId)))
    .limit(1);

  if (!row) return null;

  let partner: { id: number; name: string } | null = null;
  if (row.partnerId) {
    const [partnerRow] = await db
      .select({ id: partnersTable.id, name: partnersTable.name })
      .from(partnersTable)
      .where(eq(partnersTable.id, row.partnerId))
      .limit(1);
    partner = partnerRow ?? null;
  }

  const hardshipPortal =
    row.partnerAcceptedAt != null && row.status === "in_progress"
      ? buildHardshipPortal(row.hardshipStepsCompleted)
      : row.status === "won"
        ? buildHardshipPortal(8)
        : null;

  return mapPlanLeadDetail(row, { partner, hardshipPortal });
}

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

router.get("/me/plan-leads/:id", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Invalid plan lead id" });
      return;
    }

    const detail = await loadPlanLeadDetail(userId, id);
    if (!detail) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }

    res.json(GetPlanLeadResponse.parse(detail));
  } catch (err) {
    next(err);
  }
});

router.post("/me/plan-leads/:id/send", requireAuth, async (req, res, next) => {
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

    const [existing] = await db
      .select()
      .from(planLeadsTable)
      .where(and(eq(planLeadsTable.id, id), eq(planLeadsTable.userId, userId)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }

    if (existing.status !== "recommended") {
      res.status(400).json({ error: "Plan lead is not eligible to send" });
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
      .update(planLeadsTable)
      .set({
        partnerId: partner.id,
        sentToPartnerAt: sentAt,
        status: "in_progress",
        displayStatusChangedAt: sentAt,
        updatedAt: sentAt,
      })
      .where(eq(planLeadsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }

    res.json(
      SendPlanLeadResponse.parse(
        mapPlanLeadDetail(updated, {
          partner: { id: partner.id, name: partner.name },
        }),
      ),
    );
  } catch (err) {
    next(err);
  }
});

router.post("/me/detailed-plan", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const parsed = CreateDetailedPlanBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { cards } = parsed.data;

    for (const card of cards) {
      if (!isValidImportCardForPlanLead(card)) {
        res.status(400).json({
          error: "Each card must have a non-empty brand, balance greater than 0, and rate greater than 0",
        });
        return;
      }
    }

    let createdCount = 0;

    await db.transaction(async (tx) => {
      for (const card of cards) {
        const brand = card.brand.trim();
        const balance = card.balance;
        const rate = card.rate;
        const plaidAccountId = card.accountId?.trim() || null;
        let userCardId: number | null = null;

        if (plaidAccountId) {
          const [existingCard] = await tx
            .select()
            .from(userCardsTable)
            .where(
              and(
                eq(userCardsTable.userId, userId),
                eq(userCardsTable.plaidAccountId, plaidAccountId),
              ),
            )
            .limit(1);

          if (existingCard) {
            const [updated] = await tx
              .update(userCardsTable)
              .set({
                brand,
                balance: balance.toString(),
                rate: rate.toString(),
                source: "cabinet",
              })
              .where(eq(userCardsTable.id, existingCard.id))
              .returning();
            userCardId = updated?.id ?? existingCard.id;
          } else {
            const [inserted] = await tx
              .insert(userCardsTable)
              .values({
                userId,
                brand,
                balance: balance.toString(),
                rate: rate.toString(),
                plaidAccountId,
                source: "cabinet",
              })
              .returning({ id: userCardsTable.id });
            userCardId = inserted?.id ?? null;
          }
        } else {
          const [inserted] = await tx
            .insert(userCardsTable)
            .values({
              userId,
              brand,
              balance: balance.toString(),
              rate: rate.toString(),
              plaidAccountId: null,
              source: "cabinet",
            })
            .returning({ id: userCardsTable.id });
          userCardId = inserted?.id ?? null;
        }

        const balanceStr = balance.toString();
        const rateStr = rate.toString();

        const existingLead = await findExistingPlanLead(
          tx,
          userId,
          userCardId,
          plaidAccountId,
          brand,
          balanceStr,
          rateStr,
        );

        if (existingLead) {
          if (userCardId && !existingLead.userCardId) {
            await tx
              .update(planLeadsTable)
              .set({ userCardId, updatedAt: new Date() })
              .where(eq(planLeadsTable.id, existingLead.id));
          }
          continue;
        }

        const annualSavings = calculateAnnualSavings(balance, rate, CABINET_TARGET_APR);

        const createdAt = new Date();
        await tx.insert(planLeadsTable).values({
          userId,
          userCardId,
          plaidAccountId,
          brand,
          balance: balanceStr,
          currentApr: rateStr,
          targetApr: CABINET_TARGET_APR.toString(),
          estimatedAnnualSavings: annualSavings.toString(),
          status: "recommended",
          displayStatusChangedAt: createdAt,
          updatedAt: createdAt,
        });
        createdCount += 1;
      }
    });

    const allPlans = await db
      .select()
      .from(planLeadsTable)
      .where(eq(planLeadsTable.userId, userId))
      .orderBy(asc(planLeadsTable.createdAt));

    res.json(
      CreateDetailedPlanResponse.parse({
        createdCount,
        plans: allPlans.map(mapPlanLeadRow),
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

    const [existing] = await db
      .select()
      .from(planLeadsTable)
      .where(and(eq(planLeadsTable.id, id), eq(planLeadsTable.userId, userId)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }

    const allowed = ALLOWED_TRANSITIONS[existing.status];
    if (!allowed?.has(parsed.data.status)) {
      res.status(400).json({ error: "Invalid status transition" });
      return;
    }

    const now = new Date();
    const [updated] = await db
      .update(planLeadsTable)
      .set({
        status: parsed.data.status,
        displayStatusChangedAt: now,
        updatedAt: now,
      })
      .where(eq(planLeadsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Plan lead not found" });
      return;
    }

    res.json(UpdatePlanLeadStatusResponse.parse(mapPlanLeadRow(updated)));
  } catch (err) {
    next(err);
  }
});

export default router;
