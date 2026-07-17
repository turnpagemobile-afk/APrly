/**
 * Landing-page content — single source for marketing copy.
 */

export const brandContent = {
  name: "APrly",
  logoApr: "AP",
  logoLy: "rly",
  signature: "by APrly",
} as const;

type NavLink = { id: string; label: string; href: string };

export const navContent = {
  links: [
    { id: "audit", label: "Start Audit", href: "#optimizer" },
    { id: "how", label: "Three Steps", href: "#how" },
    { id: "why", label: "Why Trust Us", href: "#why" },
    { id: "faq", label: "Frequently Asked Questions", href: "#faq" },
  ] as readonly NavLink[],
  logIn: { label: "Log In", href: "/login" },
  getStarted: { label: "Start audit", target: "#optimizer" },
} as const;

export const heroContent = {
  headline: "Your debt isn't a character flaw. It's a math problem.",
  headlineLead: "Your debt isn't a character flaw.",
  headlineHighlight: "It's a math problem.",
  subline:
    "See exactly what your interest rate is costing you against an 8% baseline — in about 30 seconds, with no hit to your credit.",
  sublineBefore:
    "See exactly what your interest rate is costing you against an 8% baseline — in ",
  sublineBold: "about 30 seconds",
  sublineAfter: ", with no hit to your credit.",
  cta: { label: "Start Audit", target: "#optimizer" },
  videoAlt: "APrly overview video",
  posterAlt: "APrly hero video poster",
  videoCaption: "Staring at credit card balances with rates",
  interestRateLabel: "INTEREST RATE",
} as const;

export const functionsContent = {
  watermark: "APRLY",
  items: [
    "WE CAN FIND WAYS TO LOWER YOUR LOAN INTEREST RATES",
    "AUTOMATICALLY TRACKS YOUR PROGRESS",
    "BYPASSES CALL CENTERS AND WORKING DIRECTLY WITH LENDERS",
  ],
  imageAlt: "Hands holding cash",
} as const;

export type ProgressRatePair = { readonly high: number; readonly low: number };

export const progressContent = {
  title: "This is your Interest Waste",
  subtitle: "",
  body:
    "APrly compares your current loan rates to an 8% baseline, exposing the exact gap you waste on interest. We don't change your rate—we make it impossible to ignore.",
  learnMore: "Learn more",
  showLess: "Show less",
  captionWide: "Data on the 6 largest banks in the U.S.",
  captionNarrow: "Data on the 4 largest banks in the U.S.",
  /** Current vs baseline APR (%) — 6 / 4 largest banks (Figma landing-progres). */
  ratesWide: [
    { high: 25, low: 8 },
    { high: 22, low: 5 },
    { high: 18, low: 3 },
    { high: 23, low: 5 },
    { high: 25, low: 9 },
    { high: 20, low: 4 },
  ],
  ratesNarrow: [
    { high: 25, low: 8 },
    { high: 22, low: 5 },
    { high: 18, low: 3 },
    { high: 23, low: 5 },
  ],
} as const satisfies {
  title: string;
  subtitle: string;
  body: string;
  learnMore: string;
  showLess: string;
  captionWide: string;
  captionNarrow: string;
  ratesWide: readonly ProgressRatePair[];
  ratesNarrow: readonly ProgressRatePair[];
};

export const easyStepsContent = {
  title: "Three steps. Real numbers. No sales pitch.",
  steps: [
    {
      number: "1",
      title: "Connect securely with Plaid",
      tone: "primary" as const,
      body:
        "Link your accounts through Plaid, the same bank-grade connection used by thousands of trusted apps. APrly sees the numbers it needs to run your audit — and nothing it doesn't. No statements to dig up, no spreadsheets.",
    },
    {
      number: "2",
      title: "See your Interest Waste",
      tone: "teal" as const,
      body:
        "In about 30 seconds, APrly turns your balances and rates into one clear picture: how much you're paying in interest, and the gap against an 8% baseline. The Interest Melt view updates in real time so you can see exactly where the leak is.",
    },
    {
      number: "3",
      title: "Get your Verified Audit Packet",
      tone: "green" as const,
      body:
        "Walk away with your packet — and, if and when you want it, a consent-based introduction to a verified nonprofit credit counseling partner. You're in control of every step. Nothing happens without your say-so.",
    },
  ],
} as const;

export const whyContent = {
  title: "Built to be trusted with the hard numbers",
  items: [
    {
      id: "security",
      title: "Bank-level security",
      body:
        "Your accounts connect through Plaid, the bank-grade infrastructure behind many of the apps you already use. APrly reads what it needs to run your audit and never sells your financial data.",
      imageAlt: "Bank-level security",
    },
    {
      id: "credit",
      title: "No credit impact",
      body:
        "Running your audit is not a credit application. There's no hard pull and no effect on your score — it's a read of your numbers, not a request for new credit.",
      imageAlt: "No credit impact",
    },
    {
      id: "partners",
      title: "Verified nonprofit partners",
      body:
        "When you're ready for help, APrly connects you — with your consent — to verified nonprofit credit counseling partners, not to commission-driven debt settlement companies.",
      imageAlt: "Verified partners",
    },
    {
      id: "math-first",
      title: "Math-first, not shame-first",
      body:
        "We don't think you're bad with money. We think most people have never seen their numbers laid out clearly. APrly is built around that one idea: show the math, drop the judgment.",
      imageAlt: "Math-first approach",
    },
  ],
} as const;

export const statsContent = {
  items: [
    {
      id: "time",
      value: "~30",
      label: "seconds to run your audit",
    },
    {
      id: "cost",
      value: "$0",
      label: "cost to your credit score",
    },
    {
      id: "baseline",
      value: "8%",
      label: "the baseline we measure every rate against",
    },
  ],
} as const;

export const firstStepsContent = {
  blockAlt: "APRLY IS THE FIRST STEP TOWARD HELPING YOU AND YOUR LOVED ONES.",
} as const;

export const dashboardPreviewContent = {
  titleLead: "The",
  titleHighlight: "Dashboard",
  titleRest: "will help you keep track of every step of managing your bank accounts.",
  subtitleLead: "Use the website or the",
  subtitleHighlight: "APrly App",
  subtitleRest: "after activation.",
  imageAlt: "APrly dashboard on laptop",
} as const;

export const optimizerContent = {
  title: "Start Audit",
  subtitle: {
    body:
      "Get your Verified Audit Packet in 30 seconds. It maps your balances, rates, and Interest Waste against an 8% baseline. Keep it, share it, or hand it to a nonprofit counselor to start saving. If you need help adding your bank cards via Plaid, this ",
    linkText: "video tutorial will help you",
    linkHref: "#",
  },
  stepLabels: {
    1: "Step 1 of 3",
    2: "Step 2 of 3",
    3: "Step 3 of 3",
  },
  step1: {
    features: [
      {
        title: "Clarity, in writing",
        body:
          "Your balances and rates, organized — not scattered across a dozen logins.",
      },
      {
        title: "The Interest Melt view",
        body:
          "See how much of your payment is actually reducing your debt versus feeding interest.",
      },
      {
        title: "Ready to act on",
        body:
          "Share it with a verified nonprofit partner the moment you decide you want help.",
      },
    ],
    connectPlaid: "Connect via Plaid",
    plaidBanner: {
      verified: "VERIFIED",
      securityNote:
        "We use a secure and reliable method for accessing bank cards through the Plaid service.",
    },
  },
  step2: {
    continue: "Continue",
    back: "Back",
    connectMorePlaid: "Connect more via Plaid",
  },
  step3: {
    readyTitle: "Your",
    readyHighlight: "SAVING Plan",
    readySuffix: "is ready!",
    metrics: {
      totalDebt: "TOTAL DEBT",
      dailyWaste: "DAILY INTEREST WASTE",
      monthlySaving: "MONTHLY SAVING",
      annualSaving: "ANNUAL SAVING",
    },
    chartTitle: "Debt interest analysis for the next 12 months",
    chartLegendWaste: "Interest Waste (Current APR)",
    chartLegendBaseline: "Interest at 8% Baseline",
    ctaLead: "Create a free APrly account and start saving today",
    ctaLabel: "Start saving",
    back: "Back",
  },
} as const;

export type FaqContent = {
  title: string;
  subtitle: string;
  items: readonly { id: string; q: string; a: string }[];
};

export const faqContent = {
  title: "Frequently Asked Questions",
  subtitle: "",
  items: [
    {
      id: "what",
      q: "What is APrly and how does it work?",
      a: "APrly is a 30-second debt audit. You connect your accounts securely through Plaid, and APrly shows you what your interest is actually costing you compared to an 8% baseline — your Interest Waste. You get a Verified Audit Packet summarizing it all, and, when you choose to, a consent-based introduction to a verified nonprofit credit counseling partner. APrly shows you the math; you decide what to do with it.",
    },
    {
      id: "settlement",
      q: "How is APrly different from debt settlement companies?",
      a: "Debt settlement companies typically charge fees, may ask you to stop paying creditors, and can damage your credit. APrly is different on purpose: we don't settle, negotiate, or touch your accounts. We show you your numbers and connect you — only with your consent — to verified nonprofit credit counseling partners.",
    },
    {
      id: "secure",
      q: "Is my financial data secure?",
      a: "Your accounts connect through Plaid, the bank-grade service used by many of the financial apps you already trust. APrly accesses only what it needs to run your audit, and we don't sell your financial data.",
    },
    {
      id: "credit",
      q: "Does running an audit affect my credit score?",
      a: "No. Your audit is a read of your existing numbers, not an application for new credit. There's no hard inquiry and no impact on your score.",
    },
    {
      id: "interest-rate",
      q: "Will APrly lower my interest rate?",
      a: "APrly doesn't change your rates or negotiate with your lenders. What it does is make your rates and their real cost impossible to ignore — and connect you to verified nonprofit help that can work with you on a plan. The clarity is the product.",
    },
    {
      id: "six-months",
      q: "What happens after 6 months of using APrly?",
      a: "Maintaining your secure connection for at least six months triggers the Month-6 Check-In. At this milestone in your recovery program, the platform provides a structured UI review to assess your improved financial standing. This check-in determines if you are now eligible to request even deeper hardship concessions and lower rates from your lenders.",
    },
    {
      id: "no-pressure",
      q: "No sales pressure",
      a: "Running your audit doesn't put you in a sales funnel. There's no closer waiting to call you, no pitch to sit through. You see your numbers and decide what's next.",
    },
  ],
} as const;

export const planContent = {
  title: "The first step toward your financial freedom from the burden of bank interest",
  subtitle: "",
  cta: { label: "Start Audit", target: "#optimizer" },
  card: {
    heading: "Unlock APrly — US $39 one-time",
    features: [
      "24/7 automated rate negotiation",
      "Hardship portal management",
      "Real-time waste alert",
      "Priority human support",
    ],
    cta: {
      label: "Get started",
      disabled: false,
      note: "Create your account free. One-time $39 unlocks partner submission.",
    },
  },
} as const;

export const notFoundContent = {
  title: "I can't find that page",
  subtitle: "Check the address or learn more about APrly",
  cta: "Learn more",
  ctaHref: "/",
  imageAlt: "Magnifying glass illustration for page not found",
} as const;

export const footerContent = {
  links: [
    { id: "terms", label: "Terms & Conditions", href: "/terms" },
    { id: "privacy", label: "Privacy Policy", href: "/privacy" },
  ],
  social: [
    { id: "instagram", label: "Instagram", href: "#" },
    { id: "facebook", label: "Facebook", href: "#" },
    { id: "linkedin", label: "LinkedIn", href: "#" },
  ],
  copyrightTemplate: "Copyright \u00a9APrly, All rights reserved, {year}",
} as const;

export const authContent = {
  login: {
    title: "Log In",
    emailLabel: "Email",
    passwordLabel: "Password",
    forgot: "Forgot password?",
    submit: "Log In",
    signupPrompt: "Don't have an account?",
    signupLink: "Sign Up",
    errors: {
      emailRequired: "You need to enter your email to proceed",
      passwordRequired: "You need to enter password to proceed",
      invalid: "The email or password you entered is incorrect. Please try again.",
    },
  },
  signup: {
    step1Title: "Sign Up",
    step2Subtitle: "Add your personal info to your account.",
    submit: "Continue",
    saveToAccount: "Save to account",
    successTitle: "Account has been created",
    successSubtitle: "Now you can start saving with our tool.",
    successOk: "OK",
    loginPrompt: "Already have an account?",
    loginLink: "Log In",
    errors: {
      emailRequired: "You need to enter your email to proceed",
      passwordRequired: "You need to enter password to proceed",
      confirmRequired: "You need to confirm password to proceed",
      emailInvalid: "Please check the email address you entered",
      passwordsMismatch: "The passwords you enter must match",
    },
  },
  forgotPassword: {
    title: "Forgot password",
    prompt: "To proceed please enter your account email",
    emailLabel: "Email",
    submit: "Continue",
    successTitle: "Email has been sent",
    successSubtitle:
      "We've sent you an email with a link to reset your APrly account password.",
    successOk: "OK",
    errors: {
      emailRequired: "You need to enter your account email to proceed",
      emailInvalid: "Please check the email address you entered",
      serverError: "Something went wrong. Please try again later.",
    },
  },
  resetPassword: {
    pageTitle: "Account password",
    cardTitle: "Set a new password",
    newPassword: "New password",
    confirmPassword: "Confirm a new password",
    submit: "Save password",
    successMessage: "Your account password has been successfully changed.",
    goToDashboard: "Go to dashboard",
    missingToken: "This reset link is invalid or has expired.",
    backToLogin: "Back to login",
    errors: {
      fieldRequired: "This field is required",
      passwordsMismatch: "The passwords you enter must match.",
      passwordLength: "Password must be 8–20 characters.",
      invalidToken: "This reset link is invalid or has expired. Please request a new one.",
    },
  },
} as const;
