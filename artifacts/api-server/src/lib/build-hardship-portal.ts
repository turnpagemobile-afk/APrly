type HardshipStep = {
  name: string;
  status: "done" | "active" | "pending";
  description?: string;
  cta?: string;
};

export type HardshipPortal = {
  stage: string;
  progress: number;
  etaDays: number;
  steps: HardshipStep[];
};

const HARDSHIP_STEPS = [
  {
    name: "Profile verified",
    status: "done" as const,
    description: "Identity, income, and hardship cause confirmed.",
  },
  {
    name: "Hardship letter drafted",
    status: "done" as const,
    description: "Custom hardship packet sent to issuer's retention desk.",
  },
  {
    name: "Bank handshake",
    status: "active" as const,
    description: "Negotiation in progress with the assigned hardship officer (~9 days).",
  },
  {
    name: "Confirm new rate in writing",
    status: "pending" as const,
    description: "Review the issuer's official rate-change notice the moment it arrives.",
    cta: "Review notice",
  },
  {
    name: "Sign the hardship agreement",
    status: "pending" as const,
    description: "E-sign the updated terms once the issuer confirms your hardship rate.",
    cta: "Open agreement",
  },
  {
    name: "Auto-pay realignment",
    status: "pending" as const,
    description: "Point auto-pay at the new minimum so you avoid surprise late fees.",
    cta: "Update auto-pay",
  },
  {
    name: "Snowball redirect",
    status: "pending" as const,
    description: "Roll freed-up payment into your next target card in the snowball.",
    cta: "Adjust snowball",
  },
  {
    name: "Schedule next re-negotiation",
    status: "pending" as const,
    description: "Book a follow-up check-in before the hardship window closes.",
    cta: "Schedule check-in",
  },
];

export function buildHardshipPortal(): HardshipPortal {
  const doneCount = HARDSHIP_STEPS.filter((s) => s.status === "done").length;
  const progress = Math.round(((doneCount + 0.5) / HARDSHIP_STEPS.length) * 100);

  return {
    stage: "Bank Handshake",
    progress,
    etaDays: 9,
    steps: HARDSHIP_STEPS,
  };
}
