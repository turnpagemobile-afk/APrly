import crypto from "node:crypto";
import { logger } from "./logger";

export function passwordResetTtlSec(): number {
  return Number(process.env["PASSWORD_RESET_TTL_SEC"] ?? "3600");
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

export function logPasswordResetLinkForDev(email: string, url: string): void {
  logger.info(`[password-reset] reset link for ${email}: ${url} (email not sent in v1)`);
}
