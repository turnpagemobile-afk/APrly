export type SendGridEmailConfig = {
  apiKey: string;
  from: string;
  businessName: string;
  businessAddress: string;
};

const DEFAULT_FROM = "noreply@aprly.ai";
const DEFAULT_BUSINESS_NAME = "APrly";
const DEFAULT_BUSINESS_ADDRESS = "support@aprly.ai";

export function readSendGridEmailConfig(): SendGridEmailConfig | null {
  const apiKey = process.env["SENDGRID_API_KEY"]?.trim() ?? "";
  const from = process.env["EMAIL_FROM"]?.trim() || DEFAULT_FROM;
  if (!apiKey) return null;

  return {
    apiKey,
    from,
    businessName: process.env["EMAIL_BUSINESS_NAME"]?.trim() || DEFAULT_BUSINESS_NAME,
    businessAddress:
      process.env["EMAIL_BUSINESS_ADDRESS"]?.trim() || DEFAULT_BUSINESS_ADDRESS,
  };
}

export function isEmailSendingEnabled(): boolean {
  return readSendGridEmailConfig() != null;
}
