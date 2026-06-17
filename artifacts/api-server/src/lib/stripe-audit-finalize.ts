import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { ghlSyncPaidAudit } from "./ghl/ghl-sync";
import { logger } from "./logger";

/**
 * Idempotent: mark user as paid after one-time audit Checkout (mode=payment).
 */
export async function finalizeAuditCheckoutIfNeeded(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.payment_status !== "paid") return;

  const purpose = session.metadata?.["purpose"];
  const userIdStr = session.metadata?.["userId"];
  if (purpose !== "audit_packet" || !userIdStr) return;

  const userId = Number.parseInt(userIdStr, 10);
  if (!Number.isFinite(userId) || userId <= 0) return;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  const [existing] = await db
    .select({ paidAuditAt: usersTable.paidAuditAt })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!existing || existing.paidAuditAt) return;

  const patch: Partial<typeof usersTable.$inferInsert> = {
    paidAuditAt: new Date(),
  };
  if (customerId) {
    patch.stripeCustomerId = customerId;
  }

  await db.update(usersTable).set(patch).where(eq(usersTable.id, userId));

  void ghlSyncPaidAudit(userId).catch((err) =>
    logger.warn({ err, userId, event: "E3" }, "ghl paid audit sync failed"),
  );
}
