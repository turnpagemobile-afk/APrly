/**
 * Logged-in dashboard Home tab copy.
 */

export const cabinetShellContent = {
  createSavingPlan: "CREATE SAVING PLAN",
  createSavingPlanShort: "CREATE PLAN",
  tabs: {
    home: "HOME",
    dashboard: "DASHBOARD",
  },
} as const;

export const cabinetHomeContent = {
  goToDashboardCta: "GO TO DASHBOARD",
} as const;

export const dashboardPromoContent = {
  bannerTitle: "APrly. Sync Everywhere.",
  bannerBody:
    "Full APrly experience on both iOS and Android. Get easy access to APrly in a way that works best for you.",
  title: "APrly. Sync Everywhere.",
  body: "Install APrly on your home screen for quick access to your wealth cockpit — no app store required.",
  cta: { label: "DOWNLOAD APrly APP" },
  ctaInstalled: "Installed on this device",
  ctaIos: "Add to Home Screen",
  disabledNoSubscription: "Activate your APrly subscription to install the app.",
  disabledOffline: "Connect to the internet to install the app.",
  disabledInstallUnavailable:
    "Install is not available in this browser yet. Try Chrome or Edge on desktop, or Safari on iPhone.",
  offlineBanner:
    "You are offline. Reconnect to use audits, plans, and partner tools.",
  updateAvailable: "A new version of APrly is ready.",
  updateRefresh: "Refresh app",
  iosInstallTitle: "Install on iPhone or iPad",
  iosInstallSteps: [
    "Tap the Share button in Safari (square with an arrow).",
    'Choose "Add to Home Screen".',
    "Tap Add — APrly opens from your home screen like an app.",
  ],
} as const;

export const dashboardHeroContent = {
  line1: "Your debt is a math problem.",
  line2Accent: "We have the solution.",
  subtitle:
    "APrly is the wealth cockpit that hunts down credit card and personal loan interest — and gives it back.",
  cta: { label: "Start Audit" },
  disabledNoSubscription: "Activate your APrly subscription to start an audit.",
  disabledOffline: "Connect to the internet to start an audit.",
} as const;

export const dashboardStatsContent = [
  { id: "users", value: "1.5k", label: "Happy users" },
  { id: "saves", value: "US $2.8M", label: "Saves for users" },
  { id: "partners", value: "24", label: "Partners" },
] as const;

export type DashboardHowIconKey = "connect" | "audit" | "optimize";

export const dashboardHowItWorksContent = {
  title: "How does it work?",
  subtitle:
    "Get a clear path to debt freedom in three simple steps. Our automated system analyzes your situation and finds the best options.",
  items: [
    {
      iconKey: "connect" as DashboardHowIconKey,
      title: "Connect",
      body: "Securely input your current credit card balances and interest rates (APR).",
    },
    {
      iconKey: "audit" as DashboardHowIconKey,
      title: "Audit",
      body: "We scan thousands of legal debt restructuring programs and balance transfer options.",
    },
    {
      iconKey: "optimize" as DashboardHowIconKey,
      title: "Optimize",
      body: "Receive a personalized, step-by-step plan to eliminate high-interest debt.",
    },
  ],
} as const;

export const dashboardSummaryContent = {
  title: "Your Summary",
  subscriptionLabel: "Subscription Features",
  subscriptionActive: "Active",
  totalDebtLabel: "Total debt",
  savingsLabel: "Estimated Annual Savings",
  meltLabel: "Melt Countdown",
  goToDashboard: "Go to Dashboard",
  subscriptionRequiredTitle: "Subscription required",
  subscriptionRequiredBody: "Activate your APrly subscription to create a detailed plan.",
} as const;

export { faqContent as dashboardFaqContent } from "@/content/landing";
