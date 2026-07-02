import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  AdminLoginBody,
  AdminLoginResponse,
  AdminResendOtpBody,
  AdminVerifyOtpBody,
} from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { hashAdminOtpCode, issueAdminOtpChallenge } from "../lib/admin-otp";
import {
  clearAuthCookies,
  issueAuthCookies,
  verifyAdminOtpChallengeToken,
} from "../lib/auth-tokens";
import { buildAdminMeResponse } from "../lib/build-admin-me";
import { ADMIN_ROLE } from "../lib/user-roles";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

router.post("/admin/auth/login", async (req, res, next) => {
  try {
    const parsed = AdminLoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const email = parsed.data.email.trim().toLowerCase();
    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!row || row.role !== ADMIN_ROLE) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const ok = await bcrypt.compare(parsed.data.password, row.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const { challengeToken, expiresInSeconds } = await issueAdminOtpChallenge({
      userId: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
    });

    res.json(
      AdminLoginResponse.parse({
        challengeToken,
        email: row.email,
        expiresInSeconds,
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.post("/admin/auth/verify-otp", async (req, res, next) => {
  try {
    const parsed = AdminVerifyOtpBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const pending = verifyAdminOtpChallengeToken(parsed.data.challengeToken);
    if (!pending) {
      res.status(400).json({ error: "Challenge expired or invalid. Sign in again." });
      return;
    }

    if (hashAdminOtpCode(parsed.data.code) !== pending.otpHash) {
      res.status(401).json({ error: "Invalid verification code." });
      return;
    }

    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, pending.userId))
      .limit(1);

    if (!row || row.role !== ADMIN_ROLE) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await issueAuthCookies(res, row.id, ADMIN_ROLE);
    res.json(buildAdminMeResponse(row));
  } catch (err) {
    next(err);
  }
});

router.post("/admin/auth/resend-otp", async (req, res, next) => {
  try {
    const parsed = AdminResendOtpBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const pending = verifyAdminOtpChallengeToken(parsed.data.challengeToken);
    if (!pending) {
      res.status(400).json({ error: "Challenge expired or invalid. Sign in again." });
      return;
    }

    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, pending.userId))
      .limit(1);

    if (!row || row.role !== ADMIN_ROLE) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { challengeToken, expiresInSeconds } = await issueAdminOtpChallenge({
      userId: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
    });

    res.json(
      AdminLoginResponse.parse({
        challengeToken,
        email: row.email,
        expiresInSeconds,
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.post("/admin/auth/logout", async (_req, res, next) => {
  try {
    clearAuthCookies(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get("/admin/auth/me", ...requireAdmin, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!row || row.role !== ADMIN_ROLE) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.json(buildAdminMeResponse(row));
  } catch (err) {
    next(err);
  }
});

export default router;
