export type ForgotPasswordEmailContent = {
  fullName: string;
  resetUrl: string;
  expiryHours: number;
  businessName: string;
  businessAddress: string;
};

const FONT_STACK = "Figtree, Inter, Arial, sans-serif";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const FORGOT_PASSWORD_EMAIL_SUBJECT = "Reset your APrly password";

export function buildForgotPasswordPlainText(input: ForgotPasswordEmailContent): string {
  const expiryLabel = input.expiryHours === 1 ? "1 hour" : `${input.expiryHours} hours`;
  return [
    "Reset your APrly password",
    "",
    `Hello ${input.fullName},`,
    "",
    "We received a request to reset the password for your APrly account. No problem, it happens to the best of us!",
    "",
    "You can easily set up a new password by clicking the link below:",
    input.resetUrl,
    "",
    `For your security, this password reset link is temporary and will expire in ${expiryLabel}. If you don't reset your password within this timeframe, you will need to submit a new request on our website.`,
    "",
    "— The APrly Team",
    "",
    `${input.businessName} · ${input.businessAddress}`,
  ].join("\n");
}

export function buildForgotPasswordHtml(
  input: ForgotPasswordEmailContent,
  options?: { includeLogo: boolean },
): string {
  const includeLogo = options?.includeLogo ?? true;
  const fullName = escapeHtml(input.fullName);
  const resetUrl = escapeHtml(input.resetUrl);
  const businessName = escapeHtml(input.businessName);
  const businessAddress = escapeHtml(input.businessAddress);
  const expiryLabel =
    input.expiryHours === 1 ? "1 hour" : `${input.expiryHours} hours`;

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
    <title>${FORGOT_PASSWORD_EMAIL_SUBJECT}</title>
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
                  Reset your APrly password
                </h1>
                <p style="margin:0 0 16px;font-family:${FONT_STACK};font-size:16px;line-height:22px;font-weight:500;color:#000000;">
                  Hello ${fullName},
                </p>
                <p style="margin:0 0 16px;font-family:${FONT_STACK};font-size:16px;line-height:22px;font-weight:500;color:#000000;">
                  We received a request to reset the password for your APrly account. No problem, it happens to the best of us!
                </p>
                <p style="margin:0 0 24px;font-family:${FONT_STACK};font-size:16px;line-height:22px;font-weight:500;color:#000000;">
                  You can easily set up a new password by clicking the button below:
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 24px;">
                  <tr>
                    <td align="center" bgcolor="#48BE38" style="border-radius:999px;">
                      <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;font-family:${FONT_STACK};font-size:18px;line-height:24px;font-weight:800;color:#FFFFFF;text-decoration:none;text-transform:uppercase;">
                        Set a new password
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 24px;font-family:${FONT_STACK};font-size:16px;line-height:22px;font-weight:500;color:#000000;">
                  For your security, this password reset link is temporary and will expire in ${expiryLabel}. If you don't reset your password within this timeframe, you will need to submit a new request on our website.
                </p>
                <p style="margin:0;font-family:${FONT_STACK};font-size:16px;line-height:22px;font-weight:700;color:#000000;">
                  — The APrly Team
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 16px 8px;font-family:${FONT_STACK};font-size:14px;line-height:20px;font-weight:500;color:#000000;">
                ${businessName} · ${businessAddress}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
