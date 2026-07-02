import crypto from "node:crypto";
import { logger } from "./logger";

const DEFAULT_PASSWORD_RESET_TTL_SEC = 86_400;

export function passwordResetTtlSec(): number {
  const raw = process.env["PASSWORD_RESET_TTL_SEC"];
  if (raw == null || raw === "") return DEFAULT_PASSWORD_RESET_TTL_SEC;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_PASSWORD_RESET_TTL_SEC;
}

export function passwordResetExpiryHours(): number {
  return Math.max(1, Math.round(passwordResetTtlSec() / 3600));
}

export function hashPasswordResetToken(raw: string): string {
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}

export function generatePasswordResetToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(48).toString("hex");
  return { raw, hash: hashPasswordResetToken(raw) };
}

export function buildResetPasswordUrl(frontendOrigin: string, rawToken: string): string {
  const base = frontendOrigin.replace(/\/+$/, "");
  return `${base}/reset-password?token=${encodeURIComponent(rawToken)}`;
}

export function formatPasswordResetRecipientName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
): string {
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  const full = `${first} ${last}`.trim();
  return full || email;
}

export function logPasswordResetLinkForDev(email: string, url: string): void {
  logger.info(`[password-reset] reset link for ${email}: ${url} (email not sent — missing SENDGRID_API_KEY)`);
}
