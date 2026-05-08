/**
 * Landing-page content (placeholder layer).
 *
 * Every string and number rendered on the landing page lives here so we can
 * later swap to a CMS / super-admin endpoint without touching JSX. Treat this
 * file as the single editable source for marketing copy until the API is in
 * place.
 */

export const brandContent = {
  name: "APRly",
  signature: "by APRly",
} as const;

export const navContent = {
  links: [
    { id: "how", label: "How does it work?", href: "#how" },
    { id: "optimizer", label: "Verify My Savings", href: "#optimizer" },
    { id: "faq", label: "FAQ", href: "#faq" },
  ],
  logIn: { label: "Log In", note: "Coming soon" },
  getStarted: { label: "Get Started", target: "#plan" },
} as const;

export type HeroTaglineLine = {
  lead: string;
  rest: string;
  underlineLead?: boolean;
};

export const heroContent = {
  taglineLines: [
    { lead: "Stop", rest: " feeding the banks.", underlineLead: true },
    { lead: "Crush", rest: " your interest rate." },
    { lead: "Keep", rest: " your paycheck." },
  ] satisfies readonly HeroTaglineLine[],
  subtitle:
    "APRly is the wealth cockpit that hunts down credit card and personal loan interest \u2014 and gives it back.",
  cta: { label: "Verify My Savings", target: "#optimizer" },
  imageAlt: "APRly illustration",
} as const;

export const statsContent = [
  { id: "users", value: "1.5k", label: "Happy users" },
  { id: "saves", value: "US $2.8M", label: "Saves for users" },
  { id: "partners", value: "24", label: "Partners" },
] as const;

export type HowIconKey = "image" | "money" | "plan";

export const howItWorksContent = {
  title: "How does it work?",
  subtitle: "Lorem ipsum dolor sit amet, consectetur adipis elit",
  items: [
    {
      iconKey: "image" as HowIconKey,
      title: "Analysis of your situation",
      body: "Lorem ipsum dolor sit amet, consectetur adipis elit. Sit enim nec, proin faucibus nibh et sagittis a. Lacinia purus ac amet.",
    },
    {
      iconKey: "money" as HowIconKey,
      title: "Looking for legitimate ways to save money",
      body: "Lorem ipsum dolor sit amet, consectetur adipis elit. Sit enim nec, proin faucibus.",
    },
    {
      iconKey: "plan" as HowIconKey,
      title: "Providing an action plan and partner contact information",
      body: "Lorem ipsum dolor sit amet, consectetur adipis elit. Sit enim nec, proin faucibus.",
    },
  ],
} as const;

export const optimizerContent = {
  title: "Verify My Savings",
  subtitle:
    "Just punch in your total debt and rate. We'll show the leak in real time.",
  stepLabels: {
    1: "Step 1 of 3 \u2014 The Damage",
    2: "Step 2 of 3 \u2014 The Cards",
    3: "Step 3 of 3 \u2014 The Plan",
  },
} as const;

export const faqContent = {
  title: "Frequently Asked Questions",
  subtitle: "Everything you need to know about the service and billing.",
  items: [
    {
      id: "help",
      q: "How can this service help me?",
      a: "Magna sit et sollicitudin sit facilisi in cursus tortor mauris. Dolor massa vivamus metus laoreet. Auctor et lorem vitae turpis scelerisque consectetur egestas.",
    },
    {
      id: "outside-us",
      q: "Does this service work outside the U.S.?",
      a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    },
    {
      id: "cost",
      q: "How much do APRly's services cost?",
      a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    },
    {
      id: "lorem-1",
      q: "Lorem ipsum sit amet gloria? (1)",
      a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      id: "lorem-2",
      q: "Lorem ipsum sit amet gloria? (2)",
      a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      id: "lorem-3",
      q: "Lorem ipsum sit amet gloria? (3)",
      a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  ],
} as const;

export const planContent = {
  title: "Stop paying banks for your own money",
  subtitle: "One flat price. Every account watched. Every day.",
  card: {
    heading: "Activate APRly for US $39.00/month",
    features: [
      "24/7 automated rate negotiation",
      "Hardship portal management",
      "Real-time waste alert",
      "Priority human support",
      "Cancel anytime",
    ],
    cta: {
      label: "Activate APRly \u2014 $39/mo",
      disabled: true,
      note: "Available after stage launch (Stripe pending)",
    },
  },
} as const;

export const footerContent = {
  links: [
    { id: "privacy", label: "Privacy Policy", href: "/privacy" },
    { id: "terms", label: "Terms of Service", href: "/terms" },
  ],
  copyrightTemplate: "Made with \u2764 by APRly  \u00b7  All rights reserved, {year}",
} as const;
