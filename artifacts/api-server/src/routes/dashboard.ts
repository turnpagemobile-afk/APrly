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
        progress: 64,
        etaDays: 9,
        steps: [
          { name: "Profile verified", status: "done" },
          { name: "Hardship letter drafted", status: "done" },
          { name: "Bank handshake", status: "active" },
          { name: "New APR confirmed", status: "pending" },
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
