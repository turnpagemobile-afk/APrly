import { asc, eq } from "drizzle-orm";
import { db, debtLeadsTable, ghlSyncQueueTable, usersTable, type UserRow } from "@workspace/db";
import { logger } from "../logger";
import { getGhlConfig } from "./ghl-config";
import {
  postGhlWebhook,
  upsertGhlContact,
  type GhlCustomFieldInput,
  type GhlWebhookPayload,
} from "./ghl-client";
import { GHL_TAGS, type GhlWebhookEventType } from "./ghl-tags";

const RETRY_DELAYS_MS = [1000, 3000, 9000] as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function paidAuditValue(hasPaid: boolean): string {
  return hasPaid ? "Yes" : "No";
}

function isoNow(): string {
  return new Date().toISOString();
}

async function loadUser(userId: number): Promise<UserRow | null> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return user ?? null;
}

async function saveGhlContactId(userId: number, contactId: string): Promise<void> {
  await db
    .update(usersTable)
    .set({ ghlContactId: contactId })
    .where(eq(usersTable.id, userId));
}

async function countUserLeads(userId: number): Promise<number> {
  const rows = await db
    .select({ id: debtLeadsTable.id })
    .from(debtLeadsTable)
    .where(eq(debtLeadsTable.userId, userId));
  return rows.length;
}

async function planIndexForLead(userId: number, leadId: number): Promise<number> {
  const rows = await db
    .select({ id: debtLeadsTable.id })
    .from(debtLeadsTable)
    .where(eq(debtLeadsTable.userId, userId))
    .orderBy(asc(debtLeadsTable.createdAt));
  const idx = rows.findIndex((r) => r.id === leadId);
  return idx >= 0 ? idx + 1 : rows.length;
}

function buildCustomFields(
  config: NonNullable<ReturnType<typeof getGhlConfig>>,
  fields: Partial<{
    hasPaidAudit: boolean;
    paidAt: string;
    leadId: string;
    planIndex: number;
    partnerName: string;
  }>,
): GhlCustomFieldInput[] {
  const out: GhlCustomFieldInput[] = [];
  const cf = config.customFields;

  if (fields.hasPaidAudit !== undefined) {
    out.push({ id: cf.hasPaidAudit, value: paidAuditValue(fields.hasPaidAudit) });
  }
  if (fields.paidAt) {
    out.push({ id: cf.paidAt, value: fields.paidAt });
  }
  if (fields.leadId) {
    out.push({ id: cf.leadId, value: fields.leadId });
  }
  if (fields.planIndex !== undefined) {
    out.push({ id: cf.planIndex, value: String(fields.planIndex) });
  }
  if (fields.partnerName) {
    out.push({ id: cf.partnerName, value: fields.partnerName });
  }

  return out;
}

async function enqueueFailedSync(
  eventType: string,
  userId: number,
  payload: Record<string, unknown>,
  error: unknown,
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  await db.insert(ghlSyncQueueTable).values({
    eventType,
    userId,
    payload,
    attempts: RETRY_DELAYS_MS.length,
    maxAttempts: RETRY_DELAYS_MS.length,
    lastError: message,
  });
}

async function withRetry(
  eventType: string,
  userId: number,
  payload: Record<string, unknown>,
  fn: () => Promise<void>,
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      await fn();
      return;
    } catch (err) {
      lastError = err;
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]!);
      }
    }
  }
  await enqueueFailedSync(eventType, userId, payload, lastError);
  logger.warn({ err: lastError, eventType, userId }, "ghl sync failed after retries");
}

async function ensureContact(
  user: UserRow,
  tags: string[],
  customFields: GhlCustomFieldInput[],
): Promise<string> {
  const config = getGhlConfig();
  if (!config) throw new Error("GHL not enabled");

  const result = await upsertGhlContact(config, {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    tags,
    customFields,
  });

  if (user.ghlContactId !== result.contactId) {
    await saveGhlContactId(user.id, result.contactId);
  }

  return result.contactId;
}

function userWebhookPayload(
  user: UserRow,
  eventType: GhlWebhookEventType,
): GhlWebhookPayload {
  return {
    event_type: eventType,
    email: user.email,
    has_paid_audit: Boolean(user.paidAuditAt),
    timestamp: isoNow(),
  };
}

function leadWebhookPayload(
  user: UserRow,
  eventType: GhlWebhookEventType,
  leadId: number,
  planIndex: number,
  partnerName?: string,
  hardshipStepIndex?: number,
): GhlWebhookPayload {
  const payload: GhlWebhookPayload = {
    event_type: eventType,
    email: user.email,
    lead_id: String(leadId),
    plan_index: planIndex,
    has_paid_audit: Boolean(user.paidAuditAt),
    timestamp: isoNow(),
  };
  if (partnerName) payload.partner_name = partnerName;
  if (hardshipStepIndex !== undefined) payload.hardship_step_index = hardshipStepIndex;
  return payload;
}

async function postUserWebhook(
  user: UserRow,
  eventType: GhlWebhookEventType,
  queueLabel: string,
): Promise<void> {
  const config = getGhlConfig();
  if (!config) return;

  const payload = userWebhookPayload(user, eventType);
  const queuePayload = { ...payload };

  await withRetry(queueLabel, user.id, queuePayload, async () => {
    await postGhlWebhook(config, payload);
  });
}

/** E1a / E1b — registration welcome */
export async function ghlSyncRegistration(userId: number, attachedLeadCount: number): Promise<void> {
  const config = getGhlConfig();
  if (!config) return;

  const user = await loadUser(userId);
  if (!user) return;

  const hasPlan = attachedLeadCount > 0;
  const tag = hasPlan ? GHL_TAGS.registeredWithPlan : GHL_TAGS.registeredNoPlan;
  const customFields = hasPlan
    ? buildCustomFields(config, { hasPaidAudit: Boolean(user.paidAuditAt) })
    : [];

  try {
    await ensureContact(user, [tag], customFields);
  } catch (err) {
    logger.warn({ err, userId, event: "E1" }, "ghl registration sync failed");
  }
}

/** E2 — plan created (contact tag only; nurture email via scheduler after 7 days) */
export async function ghlSyncPlanCreated(userId: number, leadId: number): Promise<void> {
  const config = getGhlConfig();
  if (!config) return;

  const user = await loadUser(userId);
  if (!user) return;

  const planIndex = await planIndexForLead(userId, leadId);
  const customFields = buildCustomFields(config, {
    hasPaidAudit: Boolean(user.paidAuditAt),
    leadId: String(leadId),
    planIndex,
  });

  try {
    await ensureContact(user, [GHL_TAGS.planCreated], customFields);
  } catch (err) {
    logger.warn({ err, userId, leadId, event: "E2" }, "ghl plan created sync failed");
  }
}

/** E2 nurture — plan 7+ days without send to partner */
export async function ghlSyncNurture(userId: number, leadId: number): Promise<void> {
  const config = getGhlConfig();
  if (!config) return;

  const user = await loadUser(userId);
  if (!user) return;

  const planIndex = await planIndexForLead(userId, leadId);
  const eventType: GhlWebhookEventType = user.paidAuditAt
    ? "nurture_need_send"
    : "nurture_unlock";
  const payload = leadWebhookPayload(user, eventType, leadId, planIndex);
  const queuePayload = { ...payload };

  await withRetry(eventType, userId, queuePayload, async () => {
    await postGhlWebhook(config, payload);
  });
}

/** E3 — $39 paid (transactional, with retry) */
export async function ghlSyncPaidAudit(userId: number): Promise<void> {
  const config = getGhlConfig();
  if (!config) return;

  const user = await loadUser(userId);
  if (!user || !user.paidAuditAt) return;

  const paidAt = user.paidAuditAt.toISOString();
  const customFields = buildCustomFields(config, {
    hasPaidAudit: true,
    paidAt,
  });

  const payload = { userId, paidAt };

  await withRetry("E3", userId, payload, async () => {
    await ensureContact(user, [GHL_TAGS.paid39], customFields);
  });
}

/** E3 — payment declined */
export async function ghlSyncPaymentDeclined(userId: number): Promise<void> {
  const config = getGhlConfig();
  if (!config) return;

  const user = await loadUser(userId);
  if (!user) return;

  await postUserWebhook(user, "payment_declined", "payment_declined");
}

/** Inactivity warning 04a / 04b */
export async function ghlSyncInactivityWarning(userId: number): Promise<void> {
  const config = getGhlConfig();
  if (!config) return;

  const user = await loadUser(userId);
  if (!user) return;

  const eventType: GhlWebhookEventType = user.paidAuditAt
    ? "inactivity_warning_paid"
    : "inactivity_warning_free";

  await postUserWebhook(user, eventType, eventType);
}

/** Account saved after inactivity warning (05) */
export async function ghlSyncAccountSaved(userId: number): Promise<void> {
  const config = getGhlConfig();
  if (!config) return;

  const user = await loadUser(userId);
  if (!user) return;

  await postUserWebhook(user, "account_saved", "account_saved");
}

/** Account deleted (03) — call before user row is removed */
export async function ghlSyncAccountDeleted(user: UserRow): Promise<void> {
  const config = getGhlConfig();
  if (!config) return;

  const payload = userWebhookPayload(user, "account_deleted");
  const queuePayload = { ...payload };

  try {
    await postGhlWebhook(config, payload);
  } catch (err) {
    await enqueueFailedSync("account_deleted", user.id, queuePayload, err);
    logger.warn({ err, userId: user.id, event: "account_deleted" }, "ghl account deleted sync failed");
  }
}

/** E4 — plan sent to partner (transactional, with retry) */
export async function ghlSyncPlanSent(
  userId: number,
  leadId: number,
  partnerName: string,
): Promise<void> {
  const config = getGhlConfig();
  if (!config) return;

  const user = await loadUser(userId);
  if (!user) return;

  const planIndex = await planIndexForLead(userId, leadId);
  const payload = leadWebhookPayload(user, "plan_sent", leadId, planIndex, partnerName);
  const queuePayload = { ...payload };

  await withRetry("E4", userId, queuePayload, async () => {
    await postGhlWebhook(config, payload);
  });
}

/** Helper for E1 — total leads after guest attach */
export async function ghlCountUserLeads(userId: number): Promise<number> {
  return countUserLeads(userId);
}

type GhlAdminLeadEventOpts = {
  eventType: GhlWebhookEventType;
  tags?: string[];
  webhookOnly?: boolean;
  hardshipStepIndex?: number;
};

async function ghlSyncAdminLeadEvent(
  userId: number,
  leadId: number,
  partnerName: string | undefined,
  opts: GhlAdminLeadEventOpts,
  eventLabel: "E5" | "E6" | "E7" | "E8",
): Promise<void> {
  const config = getGhlConfig();
  if (!config) return;

  const user = await loadUser(userId);
  if (!user) return;

  const planIndex = await planIndexForLead(userId, leadId);
  const customFields = buildCustomFields(config, {
    hasPaidAudit: Boolean(user.paidAuditAt),
    leadId: String(leadId),
    planIndex,
    partnerName,
  });

  const payload = leadWebhookPayload(
    user,
    opts.eventType,
    leadId,
    planIndex,
    partnerName,
    opts.hardshipStepIndex,
  );
  const queuePayload = { ...payload };

  await withRetry(eventLabel, userId, queuePayload, async () => {
    if (!opts.webhookOnly && opts.tags?.length) {
      await ensureContact(user, opts.tags, customFields);
    }
    await postGhlWebhook(config, payload);
  });
}

/** E5 — partner review started */
export async function ghlSyncPartnerReviewStarted(
  userId: number,
  leadId: number,
  partnerName: string | undefined,
): Promise<void> {
  await ghlSyncAdminLeadEvent(
    userId,
    leadId,
    partnerName,
    { eventType: "partner_review_started", tags: [GHL_TAGS.partnerReviewStarted] },
    "E5",
  );
}

/** E6 — plan denied */
export async function ghlSyncPlanDenied(
  userId: number,
  leadId: number,
  partnerName: string | undefined,
): Promise<void> {
  await ghlSyncAdminLeadEvent(
    userId,
    leadId,
    partnerName,
    { eventType: "plan_denied", tags: [GHL_TAGS.planDenied] },
    "E6",
  );
}

/** E7 — hardship step completed (webhook only, repeatable) */
export async function ghlSyncHardshipStep(
  userId: number,
  leadId: number,
  partnerName: string | undefined,
  hardshipStepIndex: number,
): Promise<void> {
  await ghlSyncAdminLeadEvent(
    userId,
    leadId,
    partnerName,
    { eventType: "hardship_step", webhookOnly: true, hardshipStepIndex },
    "E7",
  );
}

/** E8 — plan won */
export async function ghlSyncPlanWon(
  userId: number,
  leadId: number,
  partnerName: string | undefined,
  hardshipStepIndex: number,
): Promise<void> {
  await ghlSyncAdminLeadEvent(
    userId,
    leadId,
    partnerName,
    { eventType: "plan_won", tags: [GHL_TAGS.planWon], hardshipStepIndex },
    "E8",
  );
}

export async function replayGhlSyncQueueItem(
  eventType: string,
  userId: number,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const config = getGhlConfig();
  if (!config) return false;

  if (eventType === "E3") {
    await ghlSyncPaidAudit(userId);
    return true;
  }

  if (typeof payload.event_type === "string" && typeof payload.email === "string") {
    await postGhlWebhook(config, payload as GhlWebhookPayload);
    return true;
  }

  logger.warn({ eventType, userId }, "ghl queue replay: unknown event type");
  return false;
}
