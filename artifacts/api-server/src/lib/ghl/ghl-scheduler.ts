import { and, eq, isNull, lte, sql } from "drizzle-orm";
import { db, debtLeadsTable, ghlSyncQueueTable, usersTable } from "@workspace/db";
import { deleteUserAccount } from "../delete-user-account";
import { logger } from "../logger";
import {
  ghlSyncInactivityWarning,
  ghlSyncNurture,
  replayGhlSyncQueueItem,
} from "./ghl-sync";
import { isGhlEnabled } from "./ghl-config";

const NURTURE_AFTER_DAYS = 7;
const INACTIVITY_WARNING_AFTER_MONTHS = 6;
const INACTIVITY_DELETE_AFTER_DAYS = 14;

export async function runNurtureJob(): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NURTURE_AFTER_DAYS);

  const leads = await db
    .select({
      id: debtLeadsTable.id,
      userId: debtLeadsTable.userId,
    })
    .from(debtLeadsTable)
    .where(
      and(
        sql`${debtLeadsTable.userId} IS NOT NULL`,
        isNull(debtLeadsTable.sentToPartnerAt),
        isNull(debtLeadsTable.nurtureSentAt),
        lte(debtLeadsTable.createdAt, cutoff),
      ),
    );

  let processed = 0;
  for (const lead of leads) {
    if (!lead.userId) continue;
    try {
      await ghlSyncNurture(lead.userId, lead.id);
      await db
        .update(debtLeadsTable)
        .set({ nurtureSentAt: new Date() })
        .where(eq(debtLeadsTable.id, lead.id));
      processed++;
    } catch (err) {
      logger.warn({ err, leadId: lead.id, userId: lead.userId }, "ghl nurture job failed for lead");
    }
  }

  return processed;
}

export async function runInactivityJob(): Promise<{ warned: number; deleted: number }> {
  const now = new Date();
  const warningCutoff = new Date(now);
  warningCutoff.setMonth(warningCutoff.getMonth() - INACTIVITY_WARNING_AFTER_MONTHS);

  const deleteCutoff = new Date(now);
  deleteCutoff.setDate(deleteCutoff.getDate() - INACTIVITY_DELETE_AFTER_DAYS);

  const toWarn = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(
      and(
        eq(usersTable.role, "user"),
        isNull(usersTable.inactivityWarningAt),
        lte(usersTable.lastActiveAt, warningCutoff),
      ),
    );

  let warned = 0;
  for (const { id } of toWarn) {
    try {
      await ghlSyncInactivityWarning(id);
      await db
        .update(usersTable)
        .set({ inactivityWarningAt: now })
        .where(eq(usersTable.id, id));
      warned++;
    } catch (err) {
      logger.warn({ err, userId: id }, "ghl inactivity warning failed");
    }
  }

  const toDelete = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(
      and(
        eq(usersTable.role, "user"),
        sql`${usersTable.inactivityWarningAt} IS NOT NULL`,
        lte(usersTable.inactivityWarningAt, deleteCutoff),
        sql`${usersTable.lastActiveAt} <= ${usersTable.inactivityWarningAt}`,
      ),
    );

  let deleted = 0;
  for (const { id } of toDelete) {
    try {
      const ok = await deleteUserAccount(id);
      if (ok) deleted++;
    } catch (err) {
      logger.warn({ err, userId: id }, "ghl inactivity delete failed");
    }
  }

  return { warned, deleted };
}

export async function processGhlSyncQueue(): Promise<number> {
  const pending = await db
    .select()
    .from(ghlSyncQueueTable)
    .where(isNull(ghlSyncQueueTable.completedAt))
    .limit(100);

  let replayed = 0;
  for (const row of pending) {
    try {
      const payload = row.payload as Record<string, unknown>;
      const ok = await replayGhlSyncQueueItem(row.eventType, row.userId, payload);
      if (ok) {
        await db
          .update(ghlSyncQueueTable)
          .set({ completedAt: new Date() })
          .where(eq(ghlSyncQueueTable.id, row.id));
        replayed++;
      }
    } catch (err) {
      logger.warn({ err, queueId: row.id }, "ghl sync queue replay failed");
    }
  }

  return replayed;
}

export async function runGhlScheduler(): Promise<void> {
  if (!isGhlEnabled()) {
    logger.info("ghl scheduler skipped: GHL_ENABLED is false");
    return;
  }

  const nurtureCount = await runNurtureJob();
  const inactivity = await runInactivityJob();
  const queueReplayed = await processGhlSyncQueue();

  logger.info(
    { nurtureCount, warned: inactivity.warned, deleted: inactivity.deleted, queueReplayed },
    "ghl scheduler completed",
  );
}
