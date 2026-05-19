import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import {
  GetAdminPartnerPlanLeadsResponse,
  GetAdminPartnersResponse,
} from "@workspace/api-zod";
import { db, partnersTable, planLeadsTable, usersTable } from "@workspace/db";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

router.get("/admin/partners", ...requireAdmin, async (_req, res, next) => {
  try {
    const partners = await db
      .select({ id: partnersTable.id, name: partnersTable.name })
      .from(partnersTable)
      .orderBy(asc(partnersTable.name));

    res.json(GetAdminPartnersResponse.parse({ partners }));
  } catch (err) {
    next(err);
  }
});

router.get("/admin/partners/:id/plan-leads", ...requireAdmin, async (req, res, next) => {
  try {
    const partnerId = Number(req.params.id);
    if (!Number.isInteger(partnerId) || partnerId < 1) {
      res.status(400).json({ error: "Invalid partner id" });
      return;
    }

    const [partner] = await db
      .select({ id: partnersTable.id, name: partnersTable.name })
      .from(partnersTable)
      .where(eq(partnersTable.id, partnerId))
      .limit(1);

    if (!partner) {
      res.status(404).json({ error: "Partner not found" });
      return;
    }

    const rows = await db
      .select({
        lead: planLeadsTable,
        userEmail: usersTable.email,
      })
      .from(planLeadsTable)
      .innerJoin(usersTable, eq(planLeadsTable.userId, usersTable.id))
      .where(eq(planLeadsTable.partnerId, partnerId))
      .orderBy(asc(planLeadsTable.createdAt));

    res.json(
      GetAdminPartnerPlanLeadsResponse.parse({
        partner,
        planLeads: rows.map(({ lead, userEmail }) => ({
          id: lead.id,
          brand: lead.brand,
          balance: Number(lead.balance),
          currentApr: Number(lead.currentApr),
          targetApr: Number(lead.targetApr),
          estimatedAnnualSavings: Number(lead.estimatedAnnualSavings),
          status: lead.status,
          userEmail,
          sentToPartnerAt: lead.sentToPartnerAt?.toISOString() ?? null,
          createdAt: lead.createdAt.toISOString(),
        })),
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
