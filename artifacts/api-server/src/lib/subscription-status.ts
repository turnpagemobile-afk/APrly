import { eq } from "drizzle-orm";
import { GetMeResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { getStripe } from "./stripe-client";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export type UserRow = typeof usersTable.$inferSelect;

export async function resolveSubscriptionActive(user: UserRow): Promise<boolean> {
  const subId = user.stripeSubscriptionId?.trim();
  if (!subId) return false;

  if (!process.env["STRIPE_SECRET_KEY"]?.trim()) {
    return true;
  }

  try {
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(subId);
    return ACTIVE_SUBSCRIPTION_STATUSES.has(sub.status);
  } catch {
    return false;
  }
}

export async function buildMeResponse(row: UserRow) {
  const hasActiveSubscription = await resolveSubscriptionActive(row);
  return GetMeResponse.parse({
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role,
    hasActiveSubscription,
  });
}

export async function syncUserSubscriptionFromStripe(
  subscription: { id: string; status: string },
): Promise<void> {
  const subId = subscription.id;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.stripeSubscriptionId, subId))
    .limit(1);

  if (!user) return;

  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
    await db
      .update(usersTable)
      .set({ stripeSubscriptionId: null })
      .where(eq(usersTable.id, user.id));
  }
}
