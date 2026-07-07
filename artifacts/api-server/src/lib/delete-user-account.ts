import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { getStripe } from "./stripe-client";
import { logger } from "./logger";
import { ghlSyncAccountDeleted } from "./ghl/ghl-sync";

/** Delete user account (Stripe cancel + DB cascade). Sends GHL account_deleted before removal. */
export async function deleteUserAccount(userId: number): Promise<boolean> {
  const [row] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!row) return false;

  const subId = row.stripeSubscriptionId?.trim();
  if (subId) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(subId);
    } catch (stripeErr) {
      logger.warn({ err: stripeErr, userId, subId }, "Stripe subscription cancel failed during account delete");
    }
  }

  await ghlSyncAccountDeleted(row);
  await db.delete(usersTable).where(eq(usersTable.id, userId));
  return true;
}
