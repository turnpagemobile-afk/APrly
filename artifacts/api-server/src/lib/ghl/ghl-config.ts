export type GhlConfig = {
  enabled: boolean;
  apiKey: string;
  locationId: string;
  webhookUrl: string;
  customFields: {
    hasPaidAudit: string;
    paidAt: string;
    leadId: string;
    planIndex: string;
    partnerName: string;
    appBaseUrl: string;
  };
};

function envFlag(name: string): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`GHL misconfigured: ${name} is required when GHL_ENABLED=true`);
  return v;
}

export function getGhlConfig(): GhlConfig | null {
  if (!envFlag("GHL_ENABLED")) return null;

  return {
    enabled: true,
    apiKey: requireEnv("GHL_API_KEY"),
    locationId: requireEnv("GHL_LOCATION_ID"),
    webhookUrl: requireEnv("GHL_WEBHOOK_URL"),
    customFields: {
      hasPaidAudit: requireEnv("GHL_CF_HAS_PAID_AUDIT"),
      paidAt: requireEnv("GHL_CF_PAID_AT"),
      leadId: requireEnv("GHL_CF_LEAD_ID"),
      planIndex: requireEnv("GHL_CF_PLAN_INDEX"),
      partnerName: requireEnv("GHL_CF_PARTNER_NAME"),
      appBaseUrl: requireEnv("GHL_CF_APP_BASE_URL"),
    },
  };
}

export function isGhlEnabled(): boolean {
  return getGhlConfig() !== null;
}
