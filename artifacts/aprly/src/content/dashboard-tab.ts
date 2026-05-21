import { planContent } from "@/content/landing";

export const dashboardTabContent = {
  subscriptionCard: {
    title: "Subscription Features",
    active: "Active",
    disabled: "Disabled",
  },
  upsell: {
    title: "Activate APRly for US $19.99/month",
    features: planContent.card.features,
    cta: "Activate APRly",
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
  linkedAccounts: {
    title: "Linked Bank Accounts:",
    addAriaLabel: "Add bank account",
  },
  planCard: {
    cardsLabel: "cards",
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
    successTitle: "Subscription active",
    successDescription: "Your APRly subscription is active. You can create your first plan.",
    cancelTitle: "Checkout canceled",
    cancelDescription: "You can activate APRly anytime from the Dashboard tab.",
    errorTitle: "Checkout failed",
    errorDescription: "Could not start checkout. Please try again.",
  },
} as const;
