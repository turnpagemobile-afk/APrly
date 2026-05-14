import Stripe from "stripe";
import { eq } from "drizzle-orm";
import {
  db,
  registrationIntentsTable,
  usersTable,
} from "@workspace/db";

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

  const [intent] = await db
    .select()
    .from(registrationIntentsTable)
    .where(eq(registrationIntentsTable.id, intentId))
    .limit(1);

  if (!intent) return;

  const email = intent.email.trim().toLowerCase();

  const [existingUser] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existingUser) {
    await db
      .update(registrationIntentsTable)
      .set({ status: "paid" })
      .where(eq(registrationIntentsTable.id, intentId));
    return;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        email,
        passwordHash: intent.passwordHash,
        role: "user",
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
      });
      await tx
        .update(registrationIntentsTable)
        .set({ status: "paid" })
        .where(eq(registrationIntentsTable.id, intentId));
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      await db
        .update(registrationIntentsTable)
        .set({ status: "paid" })
        .where(eq(registrationIntentsTable.id, intentId));
      return;
    }
    throw err;
  }
}
