export const GHL_TAGS = {
  registeredWithPlan: "aprly-registered-with-plan",
  registeredNoPlan: "aprly-registered-no-plan",
  planCreated: "aprly-plan-created",
  paid39: "aprly-paid-39",
} as const;

export type GhlWebhookEventType = "plan_created" | "plan_sent";
