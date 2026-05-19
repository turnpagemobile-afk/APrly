import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

/**
 * Idempotent: attach Stripe subscription to an existing user after renewal Checkout.
 */
export async function finalizeSubscriptionRenewalIfNeeded(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userIdStr = session.metadata?.["userId"];
  const purpose = session.metadata?.["purpose"];
  if (!userIdStr || purpose !== "subscription_renewal") return;

  const userId = Number.parseInt(userIdStr, 10);
  if (!Number.isFinite(userId) || userId <= 0) return;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  if (!subscriptionId) return;

  const patch: Partial<typeof usersTable.$inferInsert> = {
    stripeSubscriptionId: subscriptionId,
  };
  if (customerId) {
    patch.stripeCustomerId = customerId;
  }

  await db.update(usersTable).set(patch).where(eq(usersTable.id, userId));
}
