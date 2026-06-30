import { planContent } from "@/content/landing";

export const dashboardTabContent = {
  pageTitle: "DASHBOARD",
  subscriptionCard: {
    title: "SUBSCRIPTION FEATURES",
    active: "ACTIVE",
    disabled: "DISABLED",
  },
  upsell: {
    title: "Unlock Verified Audit Packet — US $39 one-time",
    features: planContent.card.features,
    cta: "Pay $39 — unlock partner sending",
  },
  empty: {
    line1: "TO CREATE YOUR FIRST",
    line2: "SAVING PLAN",
    line3: "AND START SAVING MONEY TODAY",
    cta: "CREATE SAVING PLAN",
  },
  summary: {
    totalDebt: "TOTAL DEBT",
    estimatedSavings: "EST. ANNUAL SAVINGS",
    meltCountdown: "MELT COUNTDOWN",
  },
  planLeads: {
    title: "YOUR SAVING PLANS",
    addAriaLabel: "Create saving plan",
    addLead: "CREATE SAVING PLAN",
  },
  planCard: {
    planLabel: "Saving Plan",
    cardsLabel: "cards",
    addCard: "ADD CARD",
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
