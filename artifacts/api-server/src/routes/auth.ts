import crypto from "node:crypto";
import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import {
  buildResetPasswordUrl,
  formatPasswordResetRecipientName,
  generatePasswordResetToken,
  hashPasswordResetToken,
  passwordResetTtlSec,
} from "../lib/password-reset";
import { sendForgotPasswordEmail } from "../lib/email/send-forgot-password-email";
import { USER_ROLE } from "../lib/user-roles";
import type Stripe from "stripe";
import {
  RegisterAndCheckoutBody,
  RegisterAndCheckoutResponse,
  GetCheckoutSessionStatusQueryParams,
  GetCheckoutSessionStatusResponse,
  LoginBody,
  LoginResponse,
  ForgotPasswordBody,
  ResetPasswordBody,
  PatchMeBody,
  PatchMeResponse,
  PatchMePasswordBody,
  RefreshSessionResponse,
} from "@workspace/api-zod";
import { attachGuestLeadsToUser } from "../lib/debt-lead-service";
import { ghlCountUserLeads, ghlSyncRegistration } from "../lib/ghl/ghl-sync";
import { touchUserActivity } from "../lib/user-activity";
import { deleteUserAccount } from "../lib/delete-user-account";
import {
  db,
  registrationIntentsTable,
  usersTable,
  refreshTokensTable,
  passwordResetTokensTable,
} from "@workspace/db";
import { getStripe } from "../lib/stripe-client";
import { finalizeCheckoutSessionIfNeeded } from "../lib/stripe-checkout-finalize";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearAuthCookies,
  hashRefreshToken,
  issueAuthCookies,
  verifyAccessToken,
} from "../lib/auth-tokens";
import { requireAuth } from "../middleware/requireAuth";
import { logger } from "../lib/logger";
import { buildMeResponse } from "../lib/subscription-status";

const router: IRouter = Router();

function fieldErrorsResponse(fieldErrors: Record<string, string[]>, status: number, res: import("express").Response) {
  res.status(status).json({ fieldErrors });
}

/** Sandbox price IDs from your env naming; legacy STRIPE_PRICE_* still supported. */
function stripeSetupFeePriceId(): string | undefined {
  const v =
    process.env["STRIPE_SANDBOX_SETUP_FEE_PRICE_ID"]?.trim() ||
    process.env["STRIPE_PRICE_ONE_TIME"]?.trim();
  return v || undefined;
}

function stripeSubscriptionPriceId(): string | undefined {
  const v =
    process.env["STRIPE_SANDBOX_SUBSCRIPTION_PRICE_ID"]?.trim() ||
    process.env["STRIPE_PRICE_SUBSCRIPTION"]?.trim();
  return v || undefined;
}

function stripeConfigured(): boolean {
  return Boolean(
    process.env["STRIPE_SECRET_KEY"]?.trim() &&
      stripeSetupFeePriceId() &&
      stripeSubscriptionPriceId(),
  );
}

function frontendOrigin(): string {
  return (process.env["FRONTEND_ORIGIN"] ?? "http://localhost:5173").replace(/\/+$/, "");
}

function parseRegisterFields(body: unknown) {
  const parsed = RegisterAndCheckoutBody.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.length ? issue.path.join(".") : "_root";
      fieldErrors[key] ??= [];
      fieldErrors[key].push(issue.message);
    }
    return { ok: false as const, fieldErrors };
  }
  const { email, password, confirmPassword, termsAccepted } = parsed.data;
  const guestSessionId = (
    parsed.data as { guestSessionId?: string | undefined }
  ).guestSessionId;
  if (password !== confirmPassword) {
    return {
      ok: false as const,
      fieldErrors: { confirmPassword: ["Passwords must match."] },
    };
  }
  if (!termsAccepted) {
    return {
      ok: false as const,
      fieldErrors: { termsAccepted: ["You must accept the terms of use."] },
    };
  }
  return {
    ok: true as const,
    email: email.trim().toLowerCase(),
    password,
    guestSessionId: guestSessionId?.trim() || null,
  };
}

router.post("/auth/register", async (req, res, next) => {
  try {
    const fields = parseRegisterFields(req.body);
    if (!fields.ok) {
      fieldErrorsResponse(fields.fieldErrors, 400, res);
      return;
    }

    const { email, password, guestSessionId } = fields;

    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existing) {
      fieldErrorsResponse(
        {
          email: [
            "This email is already registered. Sign in or use a different address.",
          ],
        },
        409,
        res,
      );
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [inserted] = await db
      .insert(usersTable)
      .values({
        email,
        passwordHash,
        role: "user",
      })
      .returning();

    if (!inserted) {
      res.status(500).json({ error: "Failed to create account." });
      return;
    }

    await attachGuestLeadsToUser(inserted.id, guestSessionId);
    void touchUserActivity(inserted.id).catch((err) =>
      logger.warn({ err, userId: inserted.id }, "touch user activity on register failed"),
    );
    void ghlCountUserLeads(inserted.id)
      .then((leadCount) => ghlSyncRegistration(inserted.id, leadCount))
      .catch((err) => logger.warn({ err, userId: inserted.id }, "ghl E1 sync failed"));
    await issueAuthCookies(res, inserted.id, inserted.role);
    res.json(LoginResponse.parse(await buildMeResponse(inserted)));
  } catch (err) {
    next(err);
  }
});

router.post("/auth/register-and-checkout", async (_req, res) => {
  res.status(410).json({
    error: "Deprecated. Use POST /auth/register and POST /me/audit-checkout when sending to a partner.",
  });
});

router.get("/auth/checkout/session-status", async (req, res, next) => {
  const setNoStore = () => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  };

  try {
    const q = GetCheckoutSessionStatusQueryParams.safeParse(req.query);
    if (!q.success) {
      setNoStore();
      res.status(400).json({ error: "Invalid query" });
      return;
    }
    const { stripeSessionId } = q.data;
    setNoStore();

    const [intent] = await db
      .select()
      .from(registrationIntentsTable)
      .where(eq(registrationIntentsTable.stripeCheckoutSessionId, stripeSessionId))
      .limit(1);

    if (!intent) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const reloadIntent = async () => {
      const [row] = await db
        .select()
        .from(registrationIntentsTable)
        .where(eq(registrationIntentsTable.stripeCheckoutSessionId, stripeSessionId))
        .limit(1);
      return row ?? null;
    };

    const syncIntentPaidIfUserExists = async (intentRow: typeof intent) => {
      const [u] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, intentRow.email))
        .limit(1);
      if (u && intentRow.status !== "paid") {
        await db
          .update(registrationIntentsTable)
          .set({ status: "paid" })
          .where(eq(registrationIntentsTable.id, intentRow.id));
      }
      return u;
    };

    let effectiveStatus = intent.status;
    let intentRow: typeof intent = intent;

    if (effectiveStatus === "pending") {
      if (!stripeConfigured()) {
        res.json(GetCheckoutSessionStatusResponse.parse({ status: "pending", user: null }));
        return;
      }
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(stripeSessionId);

      if (session.status === "open") {
        res.json(GetCheckoutSessionStatusResponse.parse({ status: "pending", user: null }));
        return;
      }
      if (session.status === "expired") {
        res.json(GetCheckoutSessionStatusResponse.parse({ status: "expired", user: null }));
        return;
      }

      await finalizeCheckoutSessionIfNeeded(session);
      const reloaded = await reloadIntent();
      if (reloaded) intentRow = reloaded;
      effectiveStatus = intentRow.status;

      if (effectiveStatus !== "paid") {
        const user = await syncIntentPaidIfUserExists(intentRow);
        if (!user) {
          res.json(GetCheckoutSessionStatusResponse.parse({ status: "processing", user: null }));
          return;
        }
        const afterSync = await reloadIntent();
        if (afterSync) intentRow = afterSync;
        effectiveStatus = intentRow.status;
      }
    }

    if (effectiveStatus !== "paid") {
      res.json(GetCheckoutSessionStatusResponse.parse({ status: "pending", user: null }));
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, intentRow.email))
      .limit(1);

    if (!user) {
      res.json(GetCheckoutSessionStatusResponse.parse({ status: "processing", user: null }));
      return;
    }

    const accessRaw = req.cookies?.[ACCESS_COOKIE];
    const verified =
      typeof accessRaw === "string" && accessRaw.length > 0 ? verifyAccessToken(accessRaw) : null;
    const already = verified?.userId === user.id;

    if (!already) {
      await issueAuthCookies(res, user.id, user.role);
    }

    res.json(
      GetCheckoutSessionStatusResponse.parse({
        status: "paid",
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
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

    if (!row) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const ok = await bcrypt.compare(parsed.data.password, row.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    await issueAuthCookies(res, row.id, row.role);
    void touchUserActivity(row.id).catch((err) =>
      logger.warn({ err, userId: row.id }, "touch user activity on login failed"),
    );
    res.json(LoginResponse.parse(await buildMeResponse(row)));
  } catch (err) {
    next(err);
  }
});

router.post("/auth/forgot-password", async (req, res, next) => {
  try {
    const parsed = ForgotPasswordBody.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.length ? String(issue.path[0]) : "email";
        fieldErrors[key] ??= [];
        fieldErrors[key].push(issue.message);
      }
      fieldErrorsResponse(fieldErrors, 400, res);
      return;
    }

    const email = parsed.data.email.trim().toLowerCase();
    const [row] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        role: usersTable.role,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (row && row.role === USER_ROLE) {
      const now = new Date();
      await db
        .update(passwordResetTokensTable)
        .set({ usedAt: now })
        .where(
          and(
            eq(passwordResetTokensTable.userId, row.id),
            isNull(passwordResetTokensTable.usedAt),
            gt(passwordResetTokensTable.expiresAt, now),
          ),
        );

      const { raw, hash } = generatePasswordResetToken();
      const expiresAt = new Date(Date.now() + passwordResetTtlSec() * 1000);
      await db.insert(passwordResetTokensTable).values({
        userId: row.id,
        tokenHash: hash,
        expiresAt,
      });

      const url = buildResetPasswordUrl(frontendOrigin(), raw);
      await sendForgotPasswordEmail({
        to: row.email,
        fullName: formatPasswordResetRecipientName(
          row.firstName,
          row.lastName,
          row.email,
        ),
        resetUrl: url,
      });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post("/auth/reset-password", async (req, res, next) => {
  try {
    const parsed = ResetPasswordBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const { token, password, confirmPassword } = parsed.data;
    if (password !== confirmPassword) {
      fieldErrorsResponse(
        { confirmPassword: ["Passwords must match."] },
        400,
        res,
      );
      return;
    }

    const tokenHash = hashPasswordResetToken(token);
    const now = new Date();
    const [tokenRow] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.tokenHash, tokenHash),
          isNull(passwordResetTokensTable.usedAt),
          gt(passwordResetTokensTable.expiresAt, now),
        ),
      )
      .limit(1);

    if (!tokenRow) {
      res.status(401).json({ error: "Invalid or expired reset token." });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, tokenRow.userId), eq(usersTable.role, USER_ROLE)))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid or expired reset token." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, user.id));

    await db
      .update(passwordResetTokensTable)
      .set({ usedAt: now })
      .where(eq(passwordResetTokensTable.id, tokenRow.id));

    await issueAuthCookies(res, user.id, user.role);
    void touchUserActivity(user.id).catch((err) =>
      logger.warn({ err, userId: user.id }, "touch user activity on reset-password failed"),
    );
    res.json(LoginResponse.parse(await buildMeResponse(user)));
  } catch (err) {
    next(err);
  }
});

router.post("/auth/logout", async (req, res, next) => {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (typeof raw === "string" && raw.length > 0) {
      const tokenHash = hashRefreshToken(raw);
      await db
        .update(refreshTokensTable)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokensTable.tokenHash, tokenHash));
    }
    clearAuthCookies(res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post("/auth/refresh", async (req, res, next) => {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (typeof raw !== "string" || raw.length === 0) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const tokenHash = hashRefreshToken(raw);
    const [row] = await db
      .select()
      .from(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.tokenHash, tokenHash),
          isNull(refreshTokensTable.revokedAt),
          gt(refreshTokensTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!row) {
      clearAuthCookies(res);
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, row.userId))
      .limit(1);

    if (!user) {
      clearAuthCookies(res);
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await issueAuthCookies(res, user.id, user.role);
    void touchUserActivity(user.id).catch((err) =>
      logger.warn({ err, userId: user.id }, "touch user activity on refresh failed"),
    );
    res.json(RefreshSessionResponse.parse(await buildMeResponse(user)));
  } catch (err) {
    next(err);
  }
});

router.get("/auth/me", requireAuth, async (req, res, next) => {
  try {
    const id = req.userId!;
    const [row] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!row) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json(await buildMeResponse(row));
  } catch (err) {
    next(err);
  }
});

router.patch("/auth/me", requireAuth, async (req, res, next) => {
  try {
    const parsed = PatchMeBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const id = req.userId!;
    const [updated] = await db
      .update(usersTable)
      .set({
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
      })
      .where(eq(usersTable.id, id))
      .returning();

    if (!updated) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json(PatchMeResponse.parse(await buildMeResponse(updated)));
  } catch (err) {
    next(err);
  }
});

router.patch("/auth/me/password", requireAuth, async (req, res, next) => {
  try {
    const parsed = PatchMePasswordBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const { currentPassword, password, confirmPassword } = parsed.data;
    if (password !== confirmPassword) {
      fieldErrorsResponse(
        { confirmPassword: ["Passwords must match."] },
        400,
        res,
      );
      return;
    }
    const id = req.userId!;
    const [row] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!row) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const currentOk = await bcrypt.compare(currentPassword, row.passwordHash);
    if (!currentOk) {
      fieldErrorsResponse(
        { currentPassword: ["Current password is incorrect."] },
        400,
        res,
      );
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [updated] = await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });

    if (!updated) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.delete("/auth/me", requireAuth, async (req, res, next) => {
  try {
    const id = req.userId!;
    const deleted = await deleteUserAccount(id);
    if (!deleted) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    clearAuthCookies(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
