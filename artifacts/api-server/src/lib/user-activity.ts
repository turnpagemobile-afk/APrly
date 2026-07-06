import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { logger } from "./logger";
import { ghlSyncAccountSaved } from "./ghl/ghl-sync";

const ACTIVITY_THROTTLE_MS = 60 * 60 * 1000;

/** Record authenticated user activity; triggers account_saved when returning after inactivity warning. */
export async function touchUserActivity(userId: number): Promise<void> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return;

  const now = new Date();
  const hadWarning = user.inactivityWarningAt != null;
  const lastActive = user.lastActiveAt ?? user.createdAt;
  const throttled =
    !hadWarning && now.getTime() - lastActive.getTime() < ACTIVITY_THROTTLE_MS;

  if (throttled) return;

  if (hadWarning) {
    await db
      .update(usersTable)
      .set({ lastActiveAt: now, inactivityWarningAt: null })
      .where(eq(usersTable.id, userId));

    void ghlSyncAccountSaved(userId).catch((err) =>
      logger.warn({ err, userId, event: "account_saved" }, "ghl account saved sync failed"),
    );
    return;
  }

  await db.update(usersTable).set({ lastActiveAt: now }).where(eq(usersTable.id, userId));
}
