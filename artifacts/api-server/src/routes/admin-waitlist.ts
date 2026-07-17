import { Router, type IRouter } from "express";
import { count, desc, ilike } from "drizzle-orm";
import {
  GetAdminWaitlistQueryParams,
  GetAdminWaitlistResponse,
} from "@workspace/api-zod";
import { db, waitlistSignupsTable } from "@workspace/db";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

router.get("/admin/waitlist", ...requireAdmin, async (req, res, next) => {
  try {
    const parsed = GetAdminWaitlistQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query" });
      return;
    }
    const { search, page, pageSize } = parsed.data;
    const q = search.trim();
    const offset = (page - 1) * pageSize;

    const searchFilter = q ? ilike(waitlistSignupsTable.email, `%${q}%`) : undefined;

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(waitlistSignupsTable)
      .where(searchFilter);

    const rows = await db
      .select({
        id: waitlistSignupsTable.id,
        email: waitlistSignupsTable.email,
        createdAt: waitlistSignupsTable.createdAt,
      })
      .from(waitlistSignupsTable)
      .where(searchFilter)
      .orderBy(desc(waitlistSignupsTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    res.json(
      GetAdminWaitlistResponse.parse({
        signups: rows.map((row) => ({
          id: row.id,
          email: row.email,
          createdAt: row.createdAt.toISOString(),
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

export default router;
