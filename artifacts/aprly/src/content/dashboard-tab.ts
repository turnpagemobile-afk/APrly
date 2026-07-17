import { planContent } from "@/content/landing";

export const dashboardTabContent = {
  pageTitle: "Dashboard",
  subscriptionCard: {
    title: "Paid features",
    active: "ACTIVE",
    disabled: "DISABLED",
  },
  upsell: {
    title: "Unlock Verified Audit Packet — US $39 one-time",
    features: planContent.card.features,
    cta: "Pay $39 — unlock partner sending",
  },
  empty: {
    line1: "To create your first",
    line2: "saving plan",
    line3: "and start saving money today",
    cta: "Create saving plan",
  },
  summary: {
    totalDebt: "Total debt",
    estimatedSavings: "Est. annual savings",
    meltCountdown: "Melt countdown",
  },
  planLeads: {
    title: "Your saving plans",
    addAriaLabel: "Create saving plan",
    addLead: "Create saving plan",
  },
  planCard: {
    planLabel: "Saving Plan",
    cardsLabel: "cards",
    addCard: "Add card",
    rateLabel: "Rate:",
    balanceLabel: "Balance:",
    totalEstSaving: "Total Est. Saving",
    perYear: "/YR",
    estimatedSavings: "Est. Saving",
    perYearShort: "/yr",
    negotiate: "Negotiate",
  },
  planStatus: {
    waiting: "WAITING",
    inProgress: "IN PROGRESS",
    won: "WON",
    denied: "DENIED",
  },
  checkout: {
    activating: "Redirecting to checkout…",
    successTitle: "Payment received",
    successDescription: "You can send plan leads to partners without limits.",
    cancelTitle: "Checkout canceled",
    cancelDescription: "You can activate APrly anytime from the Dashboard tab.",
    errorTitle: "Checkout failed",
    errorDescription: "Could not start checkout. Please try again.",
  },
} as const;
