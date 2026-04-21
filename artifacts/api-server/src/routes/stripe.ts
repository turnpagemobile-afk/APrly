import { Router, type IRouter } from "express";
import {
  CreateSubscriptionBody,
  CreateSubscriptionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/stripe/subscribe", (req, res, next) => {
  try {
    const input = CreateSubscriptionBody.parse(req.body);
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const data = CreateSubscriptionResponse.parse({
      id: `sub_sandbox_${Math.random().toString(36).slice(2, 12)}`,
      status: "active",
      plan: input.plan ?? "interest-protection-monthly",
      amount: 39,
      currency: "usd",
      currentPeriodEnd: periodEnd.toISOString(),
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
