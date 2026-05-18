import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { ImportMyCardsBody, ImportMyCardsResponse } from "@workspace/api-zod";
import { db, userCardsTable } from "@workspace/db";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

router.post("/me/cards/import", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = ImportMyCardsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { cards } = parsed.data;

    await db.transaction(async (tx) => {
      await tx
        .delete(userCardsTable)
        .where(
          and(
            eq(userCardsTable.userId, userId),
            eq(userCardsTable.source, "optimizer"),
          ),
        );

      if (cards.length > 0) {
        await tx.insert(userCardsTable).values(
          cards.map((card) => ({
            userId,
            brand: card.brand.trim(),
            balance: card.balance.toString(),
            rate: card.rate.toString(),
            plaidAccountId: card.accountId ?? null,
            source: "optimizer" as const,
          })),
        );
      }
    });

    res.json(ImportMyCardsResponse.parse({ importedCount: cards.length }));
  } catch (err) {
    next(err);
  }
});

export default router;
