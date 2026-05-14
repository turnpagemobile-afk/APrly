import crypto from "node:crypto";
import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import type Stripe from "stripe";
import {
  RegisterAndCheckoutBody,
  RegisterAndCheckoutResponse,
  GetCheckoutSessionStatusQueryParams,
  GetCheckoutSessionStatusResponse,
  LoginBody,
  LoginResponse,
  GetMeResponse,
  PatchMeBody,
  PatchMeResponse,
  RefreshSessionResponse,
} from "@workspace/api-zod";
import {
  db,
  registrationIntentsTable,
  usersTable,
  refreshTokensTable,
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

function meRowResponse(row: typeof usersTable.$inferSelect) {
  return GetMeResponse.parse({
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role,
  });
}

router.post("/auth/register-and-checkout", async (req, res, next) => {
  try {
    if (!stripeConfigured()) {
      res.status(503).json({ error: "Stripe checkout is not configured on the server." });
      return;
    }

    const parsed = RegisterAndCheckoutBody.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.length ? issue.path.join(".") : "_root";
        fieldErrors[key] ??= [];
        fieldErrors[key].push(issue.message);
      }
      fieldErrorsResponse(fieldErrors, 400, res);
      return;
    }
    const { email, password, confirmPassword, termsAccepted } = parsed.data;
    if (password !== confirmPassword) {
      fieldErrorsResponse(
        { confirmPassword: ["Passwords must match."] },
        400,
        res,
      );
      return;
    }
    if (!termsAccepted) {
      fieldErrorsResponse(
        { termsAccepted: ["You must accept the terms of use."] },
        400,
        res,
      );
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail))
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

    const intentId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const termsAcceptedAt = new Date();

    await db.insert(registrationIntentsTable).values({
      id: intentId,
      email: normalizedEmail,
      passwordHash,
      termsAcceptedAt,
      status: "pending",
    });

    const stripe = getStripe();
    const oneTime = stripeSetupFeePriceId()!;
    const recurring = stripeSubscriptionPriceId()!;
    const origin = frontendOrigin();

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: normalizedEmail,
        line_items: [
          { price: oneTime, quantity: 1 },
          { price: recurring, quantity: 1 },
        ],
        subscription_data: {
          trial_period_days: 30,
        },
        success_url: `${origin}/?stripe_session={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?stripe_cancel=1`,
        metadata: {
          registrationIntentId: intentId,
        },
      });
    } catch (stripeErr: unknown) {
      await db.delete(registrationIntentsTable).where(eq(registrationIntentsTable.id, intentId));
      const detail =
        stripeErr instanceof Error ? stripeErr.message : typeof stripeErr === "string" ? stripeErr : "Unknown error";
      logger.error({ err: stripeErr }, "Stripe checkout.sessions.create failed");
      res.status(502).json({
        error: "Stripe checkout failed",
        detail,
      });
      return;
    }

    if (!session.url || !session.id) {
      res.status(500).json({ error: "Stripe did not return a checkout URL." });
      return;
    }

    await db
      .update(registrationIntentsTable)
      .set({ stripeCheckoutSessionId: session.id })
      .where(eq(registrationIntentsTable.id, intentId));

    const payload = RegisterAndCheckoutResponse.parse({
      checkoutUrl: session.url,
      stripeSessionId: session.id,
    });
    res.json(payload);
  } catch (err) {
    next(err);
  }
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
    res.json(LoginResponse.parse(meRowResponse(row)));
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
    res.json(RefreshSessionResponse.parse(meRowResponse(user)));
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
    res.json(GetMeResponse.parse(meRowResponse(row)));
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
    res.json(PatchMeResponse.parse(meRowResponse(updated)));
  } catch (err) {
    next(err);
  }
});

export default router;
