import fs from "node:fs";
import sgMail from "@sendgrid/mail";
import { adminOtpExpiresInSeconds } from "../auth-tokens";
import { logger } from "../logger";
import { resolveEmailCopyIconPath } from "./resolve-email-copy-icon-path";
import { resolveEmailLogoPath } from "./resolve-email-logo-path";
import { readSendGridEmailConfig } from "./sendgrid-config";
import {
  ADMIN_OTP_EMAIL_SUBJECT,
  adminOtpExpiryMinutes,
  buildAdminOtpHtml,
  buildAdminOtpPlainText,
} from "./templates/admin-otp-email";

export type SendAdminOtpEmailInput = {
  to: string;
  fullName: string;
  code: string;
};

export async function sendAdminOtpEmail(input: SendAdminOtpEmailInput): Promise<void> {
  const config = readSendGridEmailConfig();
  if (!config) {
    logger.info(`[admin-otp] verification code for ${input.to}: ${input.code}`);
    return;
  }

  const ttlSec = adminOtpExpiresInSeconds();
  const content = {
    fullName: input.fullName,
    code: input.code,
    expiryMinutes: adminOtpExpiryMinutes(ttlSec),
    businessName: config.businessName,
    businessAddress: config.businessAddress,
  };

  const logoPath = resolveEmailLogoPath();
  const copyIconPath = resolveEmailCopyIconPath();
  const includeLogo = logoPath != null;
  const includeCopyIcon = copyIconPath != null;

  if (!includeLogo) {
    logger.warn("[email] admin-otp logo not found; sending without inline image");
  }
  if (!includeCopyIcon) {
    logger.warn("[email] admin-otp copy icon not found; sending without inline icon");
  }

  const attachments: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: "inline";
    content_id: string;
  }> = [];
  if (includeLogo) {
    attachments.push({
      content: fs.readFileSync(logoPath!).toString("base64"),
      filename: "logo.png",
      type: "image/png",
      disposition: "inline",
      content_id: "aprly-logo",
    });
  }
  if (includeCopyIcon) {
    attachments.push({
      content: fs.readFileSync(copyIconPath!).toString("base64"),
      filename: "copy.svg",
      type: "image/svg+xml",
      disposition: "inline",
      content_id: "aprly-copy-icon",
    });
  }

  sgMail.setApiKey(config.apiKey);

  try {
    await sgMail.send({
      to: input.to,
      from: config.from,
      subject: ADMIN_OTP_EMAIL_SUBJECT,
      text: buildAdminOtpPlainText(content),
      html: buildAdminOtpHtml(content, { includeLogo, includeCopyIcon }),
      attachments: attachments.length > 0 ? attachments : undefined,
    });
    logger.info({ to: input.to }, "[email] admin-otp sent");
  } catch (err) {
    logger.error({ err, to: input.to }, "[email] admin-otp send failed");
  }
}
