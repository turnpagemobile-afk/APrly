export const GHL_TAGS = {
  registeredWithPlan: "aprly-registered-with-plan",
  registeredNoPlan: "aprly-registered-no-plan",
  planCreated: "aprly-plan-created",
  paid39: "aprly-paid-39",
  partnerReviewStarted: "aprly-partner-review-started",
  planDenied: "aprly-plan-denied",
  planWon: "aprly-plan-won",
} as const;

export type GhlWebhookEventType =
  | "plan_created"
  | "plan_sent"
  | "partner_review_started"
  | "plan_denied"
  | "hardship_step"
  | "plan_won";
