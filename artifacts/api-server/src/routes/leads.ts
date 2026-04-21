import { Router, type IRouter } from "express";
import { CreateLeadBody, CreateLeadResponse } from "@workspace/api-zod";
import { db, leadsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/leads", async (req, res, next) => {
  try {
    const input = CreateLeadBody.parse(req.body);
    const [row] = await db
      .insert(leadsTable)
      .values({
        name: input.name,
        email: input.email,
        totalDebt: input.totalDebt.toString(),
        interestRate:
          input.interestRate !== undefined ? input.interestRate.toString() : null,
      })
      .returning();

    if (!row) {
      res.status(500).json({ error: "Failed to create lead" });
      return;
    }

    const data = CreateLeadResponse.parse({
      id: row.id,
      name: row.name,
      email: row.email,
      totalDebt: Number(row.totalDebt),
      interestRate: row.interestRate !== null ? Number(row.interestRate) : null,
      createdAt: row.createdAt.toISOString(),
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
