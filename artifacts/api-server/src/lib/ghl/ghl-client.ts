import type { GhlConfig } from "./ghl-config";
import type { GhlWebhookEventType } from "./ghl-tags";

const GHL_API_BASE = "https://services.leadconnectorhq.com";

export type GhlCustomFieldInput = { id: string; value: string | number };

export type GhlUpsertContactInput = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  tags?: string[];
  customFields?: GhlCustomFieldInput[];
};

export type GhlUpsertContactResult = {
  contactId: string;
  isNew: boolean;
};

export type GhlWebhookPayload = {
  event_type: GhlWebhookEventType;
  lead_id: string;
  plan_index: number;
  has_paid_audit: boolean;
  email: string;
  timestamp: string;
  partner_name?: string;
  hardship_step_index?: number;
};

function ghlHeaders(apiKey: string): Record<string, string> {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
    Version: "2021-07-28",
  };
}

async function parseGhlError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { message?: string };
    return json.message ?? text;
  } catch {
    return text || res.statusText;
  }
}

export async function upsertGhlContact(
  config: GhlConfig,
  input: GhlUpsertContactInput,
): Promise<GhlUpsertContactResult> {
  const body: Record<string, unknown> = {
    locationId: config.locationId,
    email: input.email,
  };
  if (input.firstName) body.firstName = input.firstName;
  if (input.lastName) body.lastName = input.lastName;
  if (input.tags?.length) body.tags = input.tags;
  if (input.customFields?.length) body.customFields = input.customFields;

  const res = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
    method: "POST",
    headers: {
      ...ghlHeaders(config.apiKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`GHL upsert contact failed (${res.status}): ${await parseGhlError(res)}`);
  }

  const data = (await res.json()) as {
    new?: boolean;
    contact?: { id?: string };
  };
  const contactId = data.contact?.id;
  if (!contactId) {
    throw new Error("GHL upsert contact: missing contact.id in response");
  }

  return { contactId, isNew: Boolean(data.new) };
}

export async function postGhlWebhook(
  config: GhlConfig,
  payload: GhlWebhookPayload,
): Promise<void> {
  const res = await fetch(config.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL webhook POST failed (${res.status}): ${text}`);
  }
}
