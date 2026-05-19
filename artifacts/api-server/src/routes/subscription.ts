import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  CreateSubscriptionCheckoutResponse,
  GetSubscriptionCheckoutSessionStatusQueryParams,
  GetSubscriptionCheckoutSessionStatusResponse,
} from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { getStripe } from "../lib/stripe-client";
import {
  frontendOrigin,
  stripeConfiguredForSubscriptionRenewal,
  stripeSubscriptionPriceId,
} from "../lib/stripe-pricing";
import { finalizeSubscriptionRenewalIfNeeded } from "../lib/stripe-subscription-renewal";
import { resolveSubscriptionActive } from "../lib/subscription-status";
import { issueAuthCookies } from "../lib/auth-tokens";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

function mapCheckoutStatus(
  sessionStatus: string | null,
  paymentStatus: string | null,
): "pending" | "processing" | "paid" | "failed" | "expired" {
  if (sessionStatus === "expired") return "expired";
  if (sessionStatus === "open") return "pending";
  if (sessionStatus === "complete") {
    if (paymentStatus === "paid" || paymentStatus === "no_payment_required") {
      return "paid";
    }
    if (paymentStatus === "unpaid") return "processing";
    return "failed";
  }
  return "processing";
}

router.post("/me/subscription/checkout", requireAuth, async (req, res, next) => {
  try {
    if (!stripeConfiguredForSubscriptionRenewal()) {
      res.status(503).json({ error: "Stripe checkout is not configured on the server." });
      return;
    }

    const userId = req.userId!;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const priceId = stripeSubscriptionPriceId()!;
    const stripe = getStripe();
    const origin = frontendOrigin();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(user.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : { customer_email: user.email }),
      success_url: `${origin}/dashboard?tab=dashboard&stripe_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?tab=dashboard&stripe_cancel=1`,
      metadata: {
        userId: String(user.id),
        purpose: "subscription_renewal",
      },
    });

    if (!session.url) {
      res.status(500).json({ error: "Failed to create checkout session." });
      return;
    }

    res.json(
      CreateSubscriptionCheckoutResponse.parse({
        checkoutUrl: session.url,
        stripeSessionId: session.id,
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.get("/me/subscription/session-status", requireAuth, async (req, res, next) => {
  try {
    const parsed = GetSubscriptionCheckoutSessionStatusQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const userId = req.userId!;
    const { stripeSessionId } = parsed.data;

    if (!stripeConfiguredForSubscriptionRenewal()) {
      res.json(
        GetSubscriptionCheckoutSessionStatusResponse.parse({
          status: "pending",
          subscriptionActive: false,
        }),
      );
      return;
    }

    const stripe = getStripe();
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    } catch {
      res.status(404).json({ error: "Unknown session" });
      return;
    }

    if (session.metadata?.["userId"] !== String(userId)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const status = mapCheckoutStatus(session.status, session.payment_status);

    if (status === "paid") {
      await finalizeSubscriptionRenewalIfNeeded(session);
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const subscriptionActive = await resolveSubscriptionActive(user);

    if (status === "paid" && subscriptionActive) {
      await issueAuthCookies(res, user.id, user.role);
    }

    res.json(
      GetSubscriptionCheckoutSessionStatusResponse.parse({
        status,
        subscriptionActive,
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
