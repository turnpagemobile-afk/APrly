import { Router, type IRouter } from "express";
import {
  CalculateOptimizationBody,
  CalculateOptimizationResponse,
} from "@workspace/api-zod";
import { parseUpsertGuestLeadBody } from "../lib/upsert-guest-lead-schema";
import { upsertGuestDebtLead } from "../lib/debt-lead-service";
import { mapDebtLeadSummary } from "../lib/lead-mapper";

const router: IRouter = Router();

function monthsToPayoff(
  balance: number,
  annualRatePct: number,
  monthlyPayment: number,
): number {
  if (balance <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (monthlyPayment <= balance * r) {
    return 600;
  }
  if (r === 0) return Math.ceil(balance / monthlyPayment);
  const n = Math.log(monthlyPayment / (monthlyPayment - balance * r)) / Math.log(1 + r);
  return Math.min(600, Math.ceil(n));
}

router.post("/optimizer/calculate", (req, res, next) => {
  try {
    const input = CalculateOptimizationBody.parse(req.body);
    const balance = input.totalDebt;
    const currentRate = input.interestRate;
    const targetRate = input.targetRate ?? 2;

    const dailyInterestWaste = (balance * (currentRate / 100)) / 365;
    const monthlyInterestWaste = (balance * (currentRate / 100)) / 12;
    const targetMonthlyInterest = (balance * (targetRate / 100)) / 12;
    const monthlySavings = Math.max(0, monthlyInterestWaste - targetMonthlyInterest);
    const annualSavings = monthlySavings * 12;

    const minPayment = Math.max(25, balance * 0.02);
    const monthlyPayment = input.monthlyPayment ?? minPayment;

    const currentPayoffMonths = monthsToPayoff(balance, currentRate, monthlyPayment);
    const newPayoffMonths = monthsToPayoff(balance, targetRate, monthlyPayment);

    const newPayoffDate = new Date();
    newPayoffDate.setMonth(newPayoffDate.getMonth() + newPayoffMonths);
    const iso = newPayoffDate.toISOString().slice(0, 10);

    const data = CalculateOptimizationResponse.parse({
      dailyInterestWaste: Math.round(dailyInterestWaste * 100) / 100,
      monthlyInterestWaste: Math.round(monthlyInterestWaste * 100) / 100,
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      annualSavings: Math.round(annualSavings * 100) / 100,
      currentPayoffMonths,
      newPayoffMonths,
      newPayoffDate: iso,
      currentRate,
      targetRate,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post("/optimizer/guest-lead", async (req, res, next) => {
  try {
    const parsed = parseUpsertGuestLeadBody(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { guestSessionId, name, email, cards } = parsed.data;
    const { lead, cards: cardRows } = await upsertGuestDebtLead({
      guestSessionId,
      name,
      email,
      cards,
    });

    const summary = mapDebtLeadSummary(lead, cardRows);
    res.json({
      leadId: lead.id,
      ...summary,
      totalBalance: summary.totalBalance,
      totalEstimatedSavings: summary.totalEstimatedSavings,
      primaryBrand: summary.primaryBrand,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
