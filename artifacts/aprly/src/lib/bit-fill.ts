import { fillRegisteredBitField } from "@/lib/bit-field-registry";

/** Allowlisted ids for Bit client tool `fillField` (must match ElevenLabs enum). */
export const BIT_FILL_FIELD_IDS = [
  "login-email",
  "login-password",
  "su-email",
  "su-password",
  "su-confirm",
  "su-terms",
  "account-first-name",
  "account-last-name",
  "partner-first-name",
  "partner-last-name",
] as const;

export type BitFillFieldId = (typeof BIT_FILL_FIELD_IDS)[number];

export function isAllowedBitFillFieldId(fieldId: string): fieldId is BitFillFieldId {
  return (BIT_FILL_FIELD_IDS as readonly string[]).includes(fieldId);
}

export function applyBitFill(
  fieldId: string,
  value: string,
): { ok: true; fieldId: string } | { ok: false; error: string } {
  if (!isAllowedBitFillFieldId(fieldId)) {
    return { ok: false, error: `Field not allowed: ${fieldId}` };
  }

  let next = value;
  if (fieldId === "su-terms") {
    const normalized = value.trim().toLowerCase();
    if (normalized !== "true" && normalized !== "false") {
      return { ok: false, error: 'su-terms value must be "true" or "false"' };
    }
    next = normalized;
  }

  return fillRegisteredBitField(fieldId, next);
}
