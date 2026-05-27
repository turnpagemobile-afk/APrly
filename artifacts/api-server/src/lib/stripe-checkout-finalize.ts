import Stripe from "stripe";
import { eq } from "drizzle-orm";
import {
  db,
  registrationIntentsTable,
  usersTable,
} from "@workspace/db";
import { attachGuestLeadsToUser } from "./debt-lead-service";

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "23505"
  );
}

/**
 * Idempotent: create user + mark registration intent paid after Checkout completes.
 * Used by Stripe webhooks and by GET /auth/checkout/session-status as a fallback when the webhook is delayed or misconfigured locally.
 */
export async function finalizeCheckoutSessionIfNeeded(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const intentId = session.metadata?.["registrationIntentId"];
  if (!intentId) return;

  if (session.payment_status !== "paid") return;

  const [intent] = await db
    .select()
    .from(registrationIntentsTable)
    .where(eq(registrationIntentsTable.id, intentId))
    .limit(1);

  if (!intent) return;

  const email = intent.email.trim().toLowerCase();
  const paidAt = new Date();

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  const [existingUser] = await db
    .select({ id: usersTable.id, paidAuditAt: usersTable.paidAuditAt })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existingUser) {
    if (!existingUser.paidAuditAt) {
      await db
        .update(usersTable)
        .set({
          paidAuditAt: paidAt,
          ...(customerId ? { stripeCustomerId: customerId } : {}),
          ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
        })
        .where(eq(usersTable.id, existingUser.id));
    }
    await db
      .update(registrationIntentsTable)
      .set({ status: "paid" })
      .where(eq(registrationIntentsTable.id, intentId));
    await attachGuestLeadsToUser(existingUser.id, intent.guestSessionId);
    return;
  }

  let newUserId: number | undefined;

  try {
    await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(usersTable)
        .values({
          email,
          passwordHash: intent.passwordHash,
          role: "user",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          paidAuditAt: paidAt,
        })
        .returning({ id: usersTable.id });
      newUserId = inserted?.id;
      await tx
        .update(registrationIntentsTable)
        .set({ status: "paid" })
        .where(eq(registrationIntentsTable.id, intentId));
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      const [user] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);
      await db
        .update(registrationIntentsTable)
        .set({ status: "paid" })
        .where(eq(registrationIntentsTable.id, intentId));
      if (user) {
        await attachGuestLeadsToUser(user.id, intent.guestSessionId);
      }
      return;
    }
    throw err;
  }

  if (newUserId) {
    await attachGuestLeadsToUser(newUserId, intent.guestSessionId);
  }
}
