import type { RequestHandler } from "express";
import { verifyAccessToken, ACCESS_COOKIE } from "../lib/auth-tokens";
import { touchUserActivity } from "../lib/user-activity";
import { logger } from "../lib/logger";

export const requireAuth: RequestHandler = (req, res, next) => {
  const raw = req.cookies?.[ACCESS_COOKIE];
  if (typeof raw !== "string" || raw.length === 0) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = verifyAccessToken(raw);
  if (!parsed) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = parsed.userId;
  req.userRole = parsed.role;

  void touchUserActivity(parsed.userId).catch((err) =>
    logger.warn({ err, userId: parsed.userId }, "touch user activity failed"),
  );

  next();
};
