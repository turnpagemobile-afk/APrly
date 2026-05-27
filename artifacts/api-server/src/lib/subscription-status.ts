import { eq } from "drizzle-orm";
import { GetMeResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export type UserRow = typeof usersTable.$inferSelect;

/** True after one-time $39 audit payment (required to send leads to a partner). */
export async function resolveHasPaidAccess(user: UserRow): Promise<boolean> {
  return user.paidAuditAt != null;
}

/** @deprecated Use resolveHasPaidAccess — name kept for call sites during transition. */
export const resolveSubscriptionActive = resolveHasPaidAccess;

export async function buildMeResponse(row: UserRow) {
  const hasActiveSubscription = await resolveHasPaidAccess(row);
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
