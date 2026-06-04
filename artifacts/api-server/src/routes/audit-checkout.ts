import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import {
  CreateAuditCheckoutBody,
  CreateAuditCheckoutResponse,
  GetAuditCheckoutSessionStatusQueryParams,
  GetAuditCheckoutSessionStatusResponse,
} from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { getStripe } from "../lib/stripe-client";
import { finalizeAuditCheckoutIfNeeded } from "../lib/stripe-audit-finalize";
import {
  appendCheckoutQueryParam,
  normalizeAuditCheckoutReturnPath,
} from "../lib/audit-checkout-return-path";
import {
  frontendOrigin,
  stripeAuditPriceId,
  stripeConfiguredForAuditCheckout,
} from "../lib/stripe-pricing";
import { resolveHasPaidAccess } from "../lib/subscription-status";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

router.post("/me/audit-checkout", requireAuth, async (req, res, next) => {
  try {
    if (!stripeConfiguredForAuditCheckout()) {
      res.status(503).json({ error: "Stripe checkout is not configured on the server." });
      return;
    }

    const userId = req.userId!;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (await resolveHasPaidAccess(user)) {
      res.status(400).json({ error: "Audit packet already unlocked." });
      return;
    }

    const bodyParsed = CreateAuditCheckoutBody.safeParse(req.body ?? {});
    const returnPath = normalizeAuditCheckoutReturnPath(
      bodyParsed.success ? bodyParsed.data.returnPath : undefined,
    );

    const priceId = stripeAuditPriceId()!;
    const stripe = getStripe();
    const origin = frontendOrigin();

    const successPath = appendCheckoutQueryParam(returnPath, "audit_session", "{CHECKOUT_SESSION_ID}");
    const cancelPath = appendCheckoutQueryParam(returnPath, "audit_cancel", "1");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(user.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : { customer_email: user.email }),
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}${cancelPath}`,
      metadata: {
        userId: String(user.id),
        purpose: "audit_packet",
        returnPath,
      },
    });

    if (!session.url || !session.id) {
      res.status(500).json({ error: "Failed to create checkout session." });
      return;
    }

    res.json(
      CreateAuditCheckoutResponse.parse({
        checkoutUrl: session.url,
        stripeSessionId: session.id,
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.get("/me/audit-checkout/session-status", requireAuth, async (req, res, next) => {
  try {
    const q = GetAuditCheckoutSessionStatusQueryParams.safeParse(req.query);
    if (!q.success) {
      res.status(400).json({ error: "Invalid query" });
      return;
    }

    const userId = req.userId!;
    const { stripeSessionId } = q.data;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!stripeConfiguredForAuditCheckout()) {
      res.json(
        GetAuditCheckoutSessionStatusResponse.parse({
          status: "pending",
          hasPaidAudit: await resolveHasPaidAccess(user),
        }),
      );
      return;
    }

    const stripe = getStripe();
    const session: Stripe.Checkout.Session =
      await stripe.checkout.sessions.retrieve(stripeSessionId);

    const metaUserId = session.metadata?.["userId"];
    if (metaUserId !== String(userId)) {
      res.status(403).json({ error: "Session does not belong to this user." });
      return;
    }

    if (session.status === "open") {
      res.json(
        GetAuditCheckoutSessionStatusResponse.parse({
          status: "pending",
          hasPaidAudit: await resolveHasPaidAccess(user),
        }),
      );
      return;
    }

    if (session.status === "expired") {
      res.json(
        GetAuditCheckoutSessionStatusResponse.parse({
          status: "expired",
          hasPaidAudit: await resolveHasPaidAccess(user),
        }),
      );
      return;
    }

    await finalizeAuditCheckoutIfNeeded(session);

    const [refreshed] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    const hasPaidAudit = refreshed ? await resolveHasPaidAccess(refreshed) : false;

    if (session.payment_status === "paid" && hasPaidAudit) {
      res.json(
        GetAuditCheckoutSessionStatusResponse.parse({
          status: "paid",
          hasPaidAudit: true,
        }),
      );
      return;
    }

    res.json(
      GetAuditCheckoutSessionStatusResponse.parse({
        status: "processing",
        hasPaidAudit,
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
