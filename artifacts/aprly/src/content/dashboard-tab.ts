import { planContent } from "@/content/landing";

export const dashboardTabContent = {
  subscriptionCard: {
    title: "Subscription Features",
    active: "Active",
    disabled: "Disabled",
  },
  upsell: {
    title: "Unlock Verified Audit Packet — US $39 one-time",
    features: planContent.card.features,
    cta: "Pay $39 — unlock partner sending",
  },
  empty: {
    body: "To create your first detailed plan, connect your accounts and run an audit.",
    cta: "Create detailed plan",
  },
  summary: {
    totalDebt: "Total debt",
    estimatedSavings: "Est. Annual Savings",
    meltCountdown: "Melt Countdown",
  },
  planLeads: {
    title: "Your plan leads",
    addAriaLabel: "Add plan lead",
    addLead: "Add lead",
  },
  planCard: {
    cardsLabel: "cards",
    addCard: "+ Add card",
    estimatedSavings: "Est. Savings",
    perYear: "/yr",
    negotiate: "Negotiate",
  },
  planStatus: {
    inProgress: "In Progress",
    won: "Won",
    denied: "Denied",
  },
  checkout: {
    activating: "Redirecting to checkout…",
    successTitle: "Payment received",
    successDescription: "You can send plan leads to partners without limits.",
    cancelTitle: "Checkout canceled",
    cancelDescription: "You can activate APRly anytime from the Dashboard tab.",
    errorTitle: "Checkout failed",
    errorDescription: "Could not start checkout. Please try again.",
  },
} as const;
