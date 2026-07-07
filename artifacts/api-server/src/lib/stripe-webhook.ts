import type { Request, Response } from "express";
import Stripe from "stripe";
import { getStripe } from "./stripe-client";
import { finalizeAuditCheckoutIfNeeded } from "./stripe-audit-finalize";
import { handleAuditPaymentDeclined } from "./stripe-audit-declined";
import { finalizeCheckoutSessionIfNeeded } from "./stripe-checkout-finalize";
import { finalizeSubscriptionRenewalIfNeeded } from "./stripe-subscription-renewal";
import { syncUserSubscriptionFromStripe } from "./subscription-status";

export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!secret) {
    res.status(503).send("Webhook not configured");
    return;
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    const sig = req.headers["stripe-signature"];
    if (typeof sig !== "string" || !Buffer.isBuffer(req.body)) {
      res.status(400).send("Missing signature or body");
      return;
    }
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await finalizeCheckoutSessionIfNeeded(session);
    await finalizeAuditCheckoutIfNeeded(session);
    await finalizeSubscriptionRenewalIfNeeded(session);
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleAuditPaymentDeclined(session);
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await handleAuditPaymentDeclined(intent);
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    await syncUserSubscriptionFromStripe(subscription);
  }

  res.json({ received: true });
}
