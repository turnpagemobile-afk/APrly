import { Router, type IRouter } from "express";
import { JoinWaitlistBody, JoinWaitlistResponse } from "@workspace/api-zod";
import { db, waitlistSignupsTable } from "@workspace/db";

const router: IRouter = Router();

function isDuplicateKeyError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  if ("code" in err && (err as { code: unknown }).code === "23505") return true;
  if ("cause" in err) return isDuplicateKeyError((err as { cause: unknown }).cause);
  return false;
}

router.post("/waitlist", async (req, res, next) => {
  try {
    const input = JoinWaitlistBody.parse(req.body);
    const email = input.email.trim().toLowerCase();
    const source = input.source?.trim() || "aprly.ai";

    try {
      await db.insert(waitlistSignupsTable).values({ email, source });
      const data = JoinWaitlistResponse.parse({ ok: true });
      res.status(201).json(data);
      return;
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        const data = JoinWaitlistResponse.parse({ ok: true });
        res.status(200).json(data);
        return;
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

export default router;
