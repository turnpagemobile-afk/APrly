import fs from "node:fs";
import sgMail from "@sendgrid/mail";
import {
  logPasswordResetLinkForDev,
  passwordResetExpiryHours,
} from "../password-reset";
import { logger } from "../logger";
import { resolveEmailLogoPath } from "./resolve-email-logo-path";
import { readSendGridEmailConfig } from "./sendgrid-config";
import {
  FORGOT_PASSWORD_EMAIL_SUBJECT,
  buildForgotPasswordHtml,
  buildForgotPasswordPlainText,
} from "./templates/forgot-password-email";

export type SendForgotPasswordEmailInput = {
  to: string;
  fullName: string;
  resetUrl: string;
};

export async function sendForgotPasswordEmail(
  input: SendForgotPasswordEmailInput,
): Promise<void> {
  const config = readSendGridEmailConfig();
  if (!config) {
    logPasswordResetLinkForDev(input.to, input.resetUrl);
    return;
  }

  const content = {
    fullName: input.fullName,
    resetUrl: input.resetUrl,
    expiryHours: passwordResetExpiryHours(),
    businessName: config.businessName,
    businessAddress: config.businessAddress,
  };

  const logoPath = resolveEmailLogoPath();
  const includeLogo = logoPath != null;
  if (!includeLogo) {
    logger.warn("[email] forgot-password logo not found; sending without inline image");
  }

  const attachments = includeLogo
    ? [
        {
          content: fs.readFileSync(logoPath!).toString("base64"),
          filename: "logo.png",
          type: "image/png",
          disposition: "inline" as const,
          content_id: "aprly-logo",
        },
      ]
    : undefined;

  sgMail.setApiKey(config.apiKey);

  try {
    await sgMail.send({
      to: input.to,
      from: config.from,
      subject: FORGOT_PASSWORD_EMAIL_SUBJECT,
      text: buildForgotPasswordPlainText(content),
      html: buildForgotPasswordHtml(content, { includeLogo }),
      attachments,
    });
    logger.info({ to: input.to }, "[email] forgot-password sent");
  } catch (err) {
    logger.error({ err, to: input.to }, "[email] forgot-password send failed");
  }
}
