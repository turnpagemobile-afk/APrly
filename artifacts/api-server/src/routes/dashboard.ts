import { Router, type IRouter } from "express";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", (_req, res, next) => {
  try {
    const data = GetDashboardSummaryResponse.parse({
      creditScore: 712,
      creditScoreDelta: 24,
      creditScoreBand: "Good",
      totalDebt: 28450,
      estimatedAnnualSavings: 5180,
      rateReductions: [
        {
          id: "rr_1",
          lender: "Chase Sapphire",
          currentApr: 24.99,
          targetApr: 9.9,
          estimatedSavings: 1820,
          status: "recommended",
        },
        {
          id: "rr_2",
          lender: "Citi Double Cash",
          currentApr: 22.49,
          targetApr: 8.5,
          estimatedSavings: 1240,
          status: "in_progress",
        },
        {
          id: "rr_3",
          lender: "Discover It",
          currentApr: 19.99,
          targetApr: 6.0,
          estimatedSavings: 980,
          status: "won",
        },
        {
          id: "rr_4",
          lender: "Capital One Quicksilver",
          currentApr: 26.99,
          targetApr: 12.0,
          estimatedSavings: 1140,
          status: "recommended",
        },
      ],
      hardshipPortal: {
        stage: "Bank Handshake",
        progress: 38,
        etaDays: 9,
        steps: [
          {
            name: "Profile verified",
            status: "done",
            description: "Identity, income, and hardship cause confirmed.",
          },
          {
            name: "Hardship letter drafted",
            status: "done",
            description: "Custom hardship packet sent to issuer's retention desk.",
          },
          {
            name: "Bank handshake",
            status: "active",
            description: "Negotiation in progress with the assigned hardship officer (~9 days).",
          },
          {
            name: "Confirm new rate in writing",
            status: "pending",
            description: "Review the issuer's official rate-change notice the moment it arrives.",
            cta: "Review notice",
          },
          {
            name: "Sign the hardship agreement",
            status: "pending",
            description: "E-sign in APRly to lock in the lower rate immediately.",
            cta: "E-sign",
          },
          {
            name: "Auto-pay realignment",
            status: "pending",
            description: "We recalculate your minimums at the new rate so nothing slips.",
            cta: "Update auto-pay",
          },
          {
            name: "Snowball redirect",
            status: "pending",
            description: "Saved interest is auto-routed to your highest-rate remaining card.",
            cta: "Set target card",
          },
          {
            name: "Schedule next re-negotiation",
            status: "pending",
            description: "APRly queues your next rate review (typically 90 days out).",
            cta: "Set reminder",
          },
        ],
      },
      linkedAccounts: [
        {
          institutionName: "Chase",
          mask: "4421",
          balance: 12480.55,
          apr: 24.99,
        },
        {
          institutionName: "Citi",
          mask: "8830",
          balance: 8420.12,
          apr: 22.49,
        },
        {
          institutionName: "Discover",
          mask: "1129",
          balance: 7549.33,
          apr: 19.99,
        },
      ],
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
