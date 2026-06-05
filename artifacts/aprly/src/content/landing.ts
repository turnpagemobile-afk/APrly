/**
 * Landing-page content — single source for marketing copy.
 */

export const brandContent = {
  name: "APRly",
  logoApr: "APR",
  logoLy: "ly",
  signature: "by APRly",
} as const;

type NavLink = { id: string; label: string; href: string };

export const navContent = {
  links: [] as readonly NavLink[],
  logIn: { label: "LOGIN", href: "/login" },
  getStarted: { label: "GET STARTED", target: "#optimizer" },
} as const;

export const heroContent = {
  headline: "YOUR DEBT IS A MATH PROBLEM.",
  headlineLead: "WE HAVE",
  headlineHighlight: "THE SOLUTION",
  cta: { label: "START AUDIT", target: "#optimizer" },
  videoAlt: "APRly overview video",
  posterAlt: "APRly hero video poster",
  videoCaption: "Staring at credit card balances with rates",
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
  title: "DISCOVER LOWER BANK INTEREST RATES",
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
  captionWide: string;
  captionNarrow: string;
  ratesWide: readonly ProgressRatePair[];
  ratesNarrow: readonly ProgressRatePair[];
};

export const easyStepsContent = {
  title: "IT'S EASY AS 1-2-3",
  steps: [
    {
      number: "1",
      title: "START AUDIT",
      tone: "primary" as const,
      body: "Review your current debt and loan costs, see the potential savings, and free yourself from the burden of bank debt.",
    },
    {
      number: "2",
      title: "GET A PLAN",
      tone: "teal" as const,
      body: "Let APRly AI help you find effective ways to lower your interest rates and save money. Get a detailed action plan, the progress of which will be automatically tracked.",
    },
    {
      number: "3",
      title: "LOREM IPSUM",
      tone: "green" as const,
      body: "Semper sed arcu nulla turpis gravida tortor volutpat. Tincidunt ultrices at risus morbi. Maecenas ridiculus et laoreet quis.",
    },
  ],
} as const;

const WHY_ITEM_BODY =
  "Urna diam sollicitudin aenean in. Purus eu venenatis pretium mi nunc tristique et pellentesque nulla. Faucibus at malesuada est eu hendrerit a.";

export const whyContent = {
  title: "WHY APRLY?",
  items: [
    {
      id: "security",
      title: "BANK-LEVEL SECURITY",
      body: WHY_ITEM_BODY,
      imageAlt: "Bank-level security",
    },
    {
      id: "credit",
      title: "NO CREDIT IMPACT",
      body: WHY_ITEM_BODY,
      imageAlt: "No credit impact",
    },
    {
      id: "partners",
      title: "VERIFIED NON-PROFIT PARTNERS",
      body: WHY_ITEM_BODY,
      imageAlt: "Verified partners",
    },
  ],
} as const;

export const firstStepsContent = {
  blockAlt: "APRLY IS THE FIRST STEP TOWARD HELPING YOU AND YOUR LOVED ONES.",
} as const;

export const dashboardPreviewContent = {
  titleLead: "THE",
  titleHighlight: "DASHBOARD",
  titleRest: "WILL HELP YOU KEEP TRACK OF EVERY STEP OF MANAGING YOUR BANK ACCOUNTS.",
  subtitleLead: "USE THE WEBSITE OR THE",
  subtitleHighlight: "APRLY APP",
  subtitleRest: "AFTER ACTIVATION.",
  imageAlt: "APRly dashboard on laptop",
} as const;

export const optimizerContent = {
  title: "START AUDIT",
  subtitle: "Just punch in your total debt and rate. We'll show the leak in real time.",
  stepLabels: {
    1: "Step 1 of 3",
    2: "Step 2 of 3",
    3: "Step 3 of 3",
  },
  step1: {
    debtLabel: "Enter your debt",
    rateLabel: "Enter the interest rate you're paying",
    continue: "CONTINUE",
  },
  step2: {
    continue: "CONTINUE",
    back: "BACK",
  },
  step3: {
    readyTitle: "YOUR",
    readyHighlight: "SAVING PLAN",
    readySuffix: "IS READY!",
    chartTitle: "DEBT INTEREST ANALYSIS FOR THE NEXT 12 MONTHS",
    chartLegendWaste: "Interest Waste (Current APR)",
    chartLegendBaseline: "Interest at 8% Baseline",
    ctaLead: "CREATE A FREE APRLY ACCOUNT AND START SAVING TODAY",
    ctaLabel: "START SAVING",
    back: "BACK",
  },
} as const;

export type FaqContent = {
  title: string;
  subtitle: string;
  items: readonly { id: string; q: string; a: string }[];
};

export const faqContent = {
  title: "FREQUENTLY ASKED QUESTIONS",
  subtitle: "",
  items: [
    {
      id: "what",
      q: "WHAT IS APRLY AND HOW DOES IT WORK?",
      a: "APRly analyzes your debt and interest rates, then helps you find legitimate ways to lower what you pay banks — with a clear plan and partner support when you're ready.",
    },
    {
      id: "secure",
      q: "IS MY FINANCIAL DATA SECURE?",
      a: "Yes. We use bank-level security practices to protect your information and never sell your personal data.",
    },
    {
      id: "cost",
      q: "HOW MUCH DOES APRLY COST?",
      a: "Creating an account is free. A one-time audit fee applies when you choose to send your plan to a partner for negotiation support.",
    },
    {
      id: "credit",
      q: "WILL THIS AFFECT MY CREDIT SCORE?",
      a: "Getting started with the audit does not require a hard credit inquiry. Partner programs may have their own requirements if you proceed.",
    },
    {
      id: "time",
      q: "HOW LONG DOES THE AUDIT TAKE?",
      a: "Most users complete the initial audit in a few minutes by entering balances and rates or connecting accounts.",
    },
    {
      id: "partner",
      q: "WHO ARE YOUR PARTNERS?",
      a: "We work with verified non-profit and licensed partners who specialize in lowering consumer interest rates.",
    },
  ],
} as const;

export const planContent = {
  title: "THE FIRST STEP TOWARD YOUR FINANCIAL FREEDOM FROM THE BURDEN OF BANK INTEREST",
  subtitle: "",
  cta: { label: "START AUDIT", target: "#optimizer" },
  card: {
    heading: "Unlock APRly — US $39 one-time",
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
  title: "I CAN'T FIND THAT PAGE",
  subtitle: "Check the address or learn more about APRly",
  cta: "LEARN MORE",
  ctaHref: "/",
  imageAlt: "Magnifying glass illustration for page not found",
} as const;

export const footerContent = {
  links: [
    { id: "terms", label: "TERMS & CONDITIONS", href: "/terms" },
    { id: "privacy", label: "PRIVACY POLICY", href: "/privacy" },
  ],
  social: [
    { id: "instagram", label: "Instagram", href: "#" },
    { id: "facebook", label: "Facebook", href: "#" },
    { id: "linkedin", label: "LinkedIn", href: "#" },
  ],
  copyrightTemplate: "Copyright \u00a9APRly, All rights reserved, {year}",
} as const;

export const authContent = {
  login: {
    title: "LOG IN",
    emailLabel: "Email",
    passwordLabel: "Password",
    forgot: "FORGOT PASSWORD?",
    submit: "LOG IN",
    signupPrompt: "Don't have an account?",
    signupLink: "SIGN UP",
    errors: {
      emailRequired: "You need to enter your email to proceed",
      passwordRequired: "You need to enter password to proceed",
      invalid: "The email or password you entered is incorrect. Please try again.",
    },
  },
  signup: {
    step1Title: "SIGN UP",
    step2Subtitle: "Add your personal info to your account.",
    submit: "CONTINUE",
    saveToAccount: "SAVE TO ACCOUNT",
    successTitle: "ACCOUNT HAS BEEN CREATED",
    successSubtitle: "Now you can start saving with our tool.",
    successOk: "OK",
    loginPrompt: "Already have an account?",
    loginLink: "LOG IN",
    errors: {
      emailRequired: "You need to enter your email to proceed",
      passwordRequired: "You need to enter password to proceed",
      confirmRequired: "You need to confirm password to proceed",
      emailInvalid: "Please check the email address you entered",
      passwordsMismatch: "The passwords you enter must match",
    },
  },
  forgotPassword: {
    title: "FORGOT PASSWORD",
    prompt: "To proceed please enter your account email",
    emailLabel: "Email",
    submit: "CONTINUE",
    successTitle: "EMAIL HAS BEEN SENT",
    successSubtitle:
      "We've sent you an email with a link to reset your APRly account password.",
    successOk: "OK",
    errors: {
      emailRequired: "You need to enter your account email to proceed",
      emailInvalid: "Please check the email address you entered",
      serverError: "Something went wrong. Please try again later.",
    },
  },
  resetPassword: {
    pageTitle: "ACCOUNT PASSWORD",
    cardTitle: "SET A NEW PASSWORD",
    newPassword: "New password",
    confirmPassword: "Confirm a new password",
    submit: "SAVE PASSWORD",
    successMessage: "Your account password has been successfully changed.",
    goToDashboard: "GO TO DASHBOARD",
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
