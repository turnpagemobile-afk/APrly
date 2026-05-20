export const HARDSHIP_STEPS_TOTAL = 8;

export type HardshipStepDefinition = {
  name: string;
  description: string;
  cta?: string;
};

/** Linear v1 lifecycle — 8 steps from admin mock (no duplicate send stages). */
export const HARDSHIP_STEP_DEFINITIONS: HardshipStepDefinition[] = [
  {
    name: "Profile verified",
    description: "Identity, income, and hardship cause confirmed.",
  },
  {
    name: "Hardship letter drafted",
    description: "Custom hardship packet sent to issuer's retention desk.",
  },
  {
    name: "Bank handshake",
    description: "Negotiation in progress with the assigned hardship officer (~9 days).",
  },
  {
    name: "Confirm new rate in writing",
    description: "Review the issuer's official rate-change notice the moment it arrives.",
    cta: "Review notice",
  },
  {
    name: "Sign the hardship agreement",
    description: "E-sign in APRly to lock in the lower rate immediately.",
    cta: "E-sign",
  },
  {
    name: "Auto-pay realignment",
    description: "We recalculate your minimums at the new rate so nothing slips.",
    cta: "Update auto-pay",
  },
  {
    name: "Snowball redirect",
    description: "Saved interest is auto-routed to your highest-rate remaining card.",
    cta: "Set target card",
  },
  {
    name: "Schedule next re-negotiation",
    description: "APRly queues your next rate review (typically 90 days out).",
    cta: "Set reminder",
  },
];
