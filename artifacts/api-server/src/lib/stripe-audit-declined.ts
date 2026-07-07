import type Stripe from "stripe";
import { logger } from "./logger";
import { ghlSyncPaymentDeclined } from "./ghl/ghl-sync";

function parseAuditUserId(metadata: Stripe.Metadata | null | undefined): number | null {
  if (!metadata) return null;
  if (metadata["purpose"] !== "audit_packet") return null;
  const userIdStr = metadata["userId"];
  if (!userIdStr) return null;
  const userId = Number.parseInt(userIdStr, 10);
  if (!Number.isFinite(userId) || userId <= 0) return null;
  return userId;
}

export async function handleAuditPaymentDeclined(
  sessionOrIntent: Stripe.Checkout.Session | Stripe.PaymentIntent,
): Promise<void> {
  const userId = parseAuditUserId(sessionOrIntent.metadata);
  if (!userId) return;

  void ghlSyncPaymentDeclined(userId).catch((err) =>
    logger.warn({ err, userId, event: "payment_declined" }, "ghl payment declined sync failed"),
  );
}
