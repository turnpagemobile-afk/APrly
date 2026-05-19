import { logger } from "./logger";

/** v1: fixed code until email delivery is implemented. */
export function generateAdminOtpCode(): string {
  return "111111";
}

export function logAdminOtpForDev(email: string, code: string): void {
  logger.info(`[admin-otp] verification code for ${email}: ${code} (email not sent in v1)`);
}
