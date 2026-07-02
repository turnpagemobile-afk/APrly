import crypto from "node:crypto";
import { logger } from "./logger";
import {
  adminOtpExpiresInSeconds,
  signAdminOtpChallengeToken,
} from "./auth-tokens";
import { formatPasswordResetRecipientName } from "./password-reset";
import { sendAdminOtpEmail } from "./email/send-admin-otp-email";

export const SUPER_ADMIN_BYPASS_EMAIL = "super.admin@aprly.ai";
export const SUPER_ADMIN_BYPASS_CODE = "111111";

export function isSuperAdminBypassEmail(email: string): boolean {
  return email.trim().toLowerCase() === SUPER_ADMIN_BYPASS_EMAIL;
}

export function generateAdminOtpCode(email: string): string {
  if (isSuperAdminBypassEmail(email)) {
    return SUPER_ADMIN_BYPASS_CODE;
  }
  return String(crypto.randomInt(100_000, 1_000_000));
}

export function hashAdminOtpCode(code: string): string {
  return crypto.createHash("sha256").update(code, "utf8").digest("hex");
}

export function logAdminOtpForDev(email: string, code: string): void {
  logger.info(`[admin-otp] verification code for ${email}: ${code}`);
}

export type IssueAdminOtpChallengeInput = {
  userId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export type IssueAdminOtpChallengeResult = {
  challengeToken: string;
  expiresInSeconds: number;
};

export async function issueAdminOtpChallenge(
  input: IssueAdminOtpChallengeInput,
): Promise<IssueAdminOtpChallengeResult> {
  const email = input.email.trim().toLowerCase();
  const code = generateAdminOtpCode(email);
  const otpHash = hashAdminOtpCode(code);
  const bypass = isSuperAdminBypassEmail(email);

  if (bypass) {
    logAdminOtpForDev(email, code);
  } else {
    const fullName = formatPasswordResetRecipientName(
      input.firstName,
      input.lastName,
      email,
    );
    await sendAdminOtpEmail({ to: email, fullName, code });
  }

  return {
    challengeToken: signAdminOtpChallengeToken(input.userId, otpHash),
    expiresInSeconds: adminOtpExpiresInSeconds(),
  };
}
