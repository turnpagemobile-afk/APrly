import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { GetDashboardSummaryResponse, GetDashboardTabResponse } from "@workspace/api-zod";
import { db, planLeadsTable, userCardsTable, usersTable } from "@workspace/db";
import { resolveSubscriptionActive } from "../lib/subscription-status";
import { mapPlanLeadRow } from "../lib/plan-lead-mapper";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

function maskForCard(brand: string, plaidAccountId: string | null): string {
  if (plaidAccountId && plaidAccountId.length >= 4) {
    return plaidAccountId.slice(-4);
  }
  const digits = brand.replace(/\D/g, "");
  if (digits.length >= 4) return digits.slice(-4);
  return "0000";
}

router.get("/dashboard/summary", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const cards = await db
      .select()
      .from(userCardsTable)
      .where(eq(userCardsTable.userId, userId));

    const linkedAccounts = cards.map((card) => ({
      institutionName: card.brand,
      mask: maskForCard(card.brand, card.plaidAccountId),
      balance: Number(card.balance),
      apr: Number(card.rate),
    }));

    const totalDebt = linkedAccounts.reduce((sum, row) => sum + row.balance, 0);
    const estimatedAnnualSavings =
      totalDebt > 0
        ? linkedAccounts.reduce((sum, row) => {
            const spread = Math.max(0, row.apr - 8);
            return sum + row.balance * (spread / 100);
          }, 0)
        : 0;

    const data = GetDashboardSummaryResponse.parse({
      creditScore: 712,
      creditScoreDelta: 24,
      creditScoreBand: "Good",
      totalDebt: Math.round(totalDebt * 100) / 100,
      estimatedAnnualSavings: Math.round(estimatedAnnualSavings * 100) / 100,
      rateReductions:
        linkedAccounts.length > 0
          ? linkedAccounts.map((row, i) => ({
              id: `rr_${i + 1}`,
              lender: row.institutionName,
              currentApr: row.apr,
              targetApr: 8,
              estimatedSavings: Math.round(row.balance * (Math.max(0, row.apr - 8) / 100) * 100) / 100,
              status: "recommended" as const,
            }))
          : [],
      hardshipPortal: {
        stage: "Bank Handshake",
        progress: 38,
        etaDays: 9,
        steps: [
          {
            name: "Profile verified",
            status: "done",
            description: "Identity, income, and hardship cause confirmed.",
          },
          {
            name: "Hardship letter drafted",
            status: "done",
            description: "Custom hardship packet sent to issuer's retention desk.",
          },
          {
            name: "Bank handshake",
            status: "active",
            description: "Negotiation in progress with the assigned hardship officer (~9 days).",
          },
          {
            name: "Confirm new rate in writing",
            status: "pending",
            description: "Review the issuer's official rate-change notice the moment it arrives.",
            cta: "Review notice",
          },
        ],
      },
      linkedAccounts,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/dashboard/tab", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const subscriptionActive = await resolveSubscriptionActive(user);

    const plans = await db
      .select()
      .from(planLeadsTable)
      .where(eq(planLeadsTable.userId, userId))
      .orderBy(asc(planLeadsTable.createdAt));

    const mappedPlans = plans.map(mapPlanLeadRow);
    const totalDebt = mappedPlans.reduce((sum, p) => sum + p.balance, 0);
    const estimatedAnnualSavings = mappedPlans.reduce(
      (sum, p) => sum + p.estimatedAnnualSavings,
      0,
    );

    res.json(
      GetDashboardTabResponse.parse({
        subscriptionActive,
        hasLeads: mappedPlans.length > 0,
        plans: mappedPlans,
        summary: {
          totalDebt: Math.round(totalDebt * 100) / 100,
          estimatedAnnualSavings: Math.round(estimatedAnnualSavings * 100) / 100,
        },
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
