export type AdminOtpEmailContent = {
  fullName: string;
  code: string;
  expiryMinutes: number;
  businessName: string;
  businessAddress: string;
};

const FONT_STACK = "Figtree, Inter, Arial, sans-serif";
const DIVIDER_COLOR = "#EADFD1";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function horizontalDivider(): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
            <tr>
              <td style="border-top:1px solid ${DIVIDER_COLOR};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
          </table>`;
}

export const ADMIN_OTP_EMAIL_SUBJECT = "Your verification code for APrly Admin Panel";

export function adminOtpExpiryMinutes(ttlSec: number): number {
  return Math.max(1, Math.round(ttlSec / 60));
}

export function buildAdminOtpPlainText(input: AdminOtpEmailContent): string {
  const expiryLabel =
    input.expiryMinutes === 1 ? "1 minute" : `${input.expiryMinutes} minutes`;
  return [
    "Your Verification Code for APrly Admin Panel Sign-in",
    "",
    `Hello ${input.fullName},`,
    "",
    "Your one-time verification code (OTP) for the Admin Panel sign-in is:",
    input.code,
    "",
    `This code is valid for ${expiryLabel}. Please do not share this code with anyone.`,
    "",
    "If you did not attempt to sign in, please ignore this email.",
    "",
    "— The APrly Team",
    "",
    `${input.businessName} · ${input.businessAddress}`,
  ].join("\n");
}

function buildCodeBlock(code: string, includeCopyIcon: boolean): string {
  const copyIconCell = includeCopyIcon
    ? `<td style="padding:14px 20px 14px 8px;vertical-align:middle;">
                <img src="cid:aprly-copy-icon" alt="" width="24" height="24" style="display:block;border:0;" />
              </td>`
    : "";

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 24px;background-color:#FFFFFF;border:1px solid #C4C7CC;border-radius:12px;">
                  <tr>
                    <td style="padding:14px 8px 14px 20px;vertical-align:middle;">
                      <span style="font-family:${FONT_STACK};font-size:24px;line-height:32px;font-weight:600;color:#202226;letter-spacing:6px;">${code}</span>
                    </td>
                    ${copyIconCell}
                  </tr>
                </table>`;
}

export function buildAdminOtpHtml(
  input: AdminOtpEmailContent,
  options?: { includeLogo?: boolean; includeCopyIcon?: boolean },
): string {
  const includeLogo = options?.includeLogo ?? true;
  const includeCopyIcon = options?.includeCopyIcon ?? true;
  const fullName = escapeHtml(input.fullName);
  const code = escapeHtml(input.code);
  const businessName = escapeHtml(input.businessName);
  const businessAddress = escapeHtml(input.businessAddress);
  const expiryLabel =
    input.expiryMinutes === 1 ? "1 minute" : `${input.expiryMinutes} minutes`;

  const logoBlock = includeLogo
    ? `<tr>
            <td align="center" style="background-color:#2E6F40;padding:24px 32px;">
              <img src="cid:aprly-logo" alt="APrly" width="120" style="display:block;border:0;outline:none;text-decoration:none;height:auto;" />
            </td>
          </tr>`
    : `<tr>
            <td align="center" style="background-color:#2E6F40;padding:24px 32px;">
              <span style="font-family:${FONT_STACK};font-size:28px;font-weight:700;color:#CCF7C7;">APrly</span>
            </td>
          </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${ADMIN_OTP_EMAIL_SUBJECT}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#CCF7C7;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#CCF7C7;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
            ${logoBlock}
            <tr>
              <td style="background-color:#FFFFFF;padding:32px 28px 24px;">
                <h1 style="margin:0 0 24px;font-family:${FONT_STACK};font-size:28px;line-height:32px;font-weight:700;color:#000000;text-align:center;">
                  Your Verification Code for APrly Admin Panel Sign-in
                </h1>
                ${horizontalDivider()}
                <p style="margin:0 0 16px;font-family:${FONT_STACK};font-size:16px;line-height:22px;font-weight:500;color:#000000;">
                  Hello ${fullName},
                </p>
                <p style="margin:0 0 24px;font-family:${FONT_STACK};font-size:16px;line-height:22px;font-weight:500;color:#000000;">
                  Your one-time verification code (OTP) for the Admin Panel sign-in is:
                </p>
                ${buildCodeBlock(code, includeCopyIcon)}
                <p style="margin:0 0 16px;font-family:${FONT_STACK};font-size:16px;line-height:22px;font-weight:500;color:#000000;">
                  This code is valid for ${expiryLabel}. Please do not share this code with anyone.
                </p>
                <p style="margin:0 0 24px;font-family:${FONT_STACK};font-size:16px;line-height:22px;font-weight:500;color:#000000;">
                  If you did not attempt to sign in, please ignore this email.
                </p>
                <p style="margin:0 0 24px;font-family:${FONT_STACK};font-size:16px;line-height:22px;font-weight:700;color:#000000;">
                  — The APrly Team
                </p>
                ${horizontalDivider()}
                <p style="margin:0;font-family:${FONT_STACK};font-size:14px;line-height:20px;font-weight:500;color:#000000;">
                  ${businessName} · ${businessAddress}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
