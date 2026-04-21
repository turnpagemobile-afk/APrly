import { Router, type IRouter } from "express";
import {
  CreatePlaidLinkTokenResponse,
  ExchangePlaidPublicTokenBody,
  ExchangePlaidPublicTokenResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/plaid/link-token", (_req, res, next) => {
  try {
    const expiration = new Date(Date.now() + 1000 * 60 * 30).toISOString();
    const linkToken = `link-sandbox-${Math.random().toString(36).slice(2, 12)}`;
    const data = CreatePlaidLinkTokenResponse.parse({
      linkToken,
      expiration,
      sandbox: true,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post("/plaid/exchange", (req, res, next) => {
  try {
    const input = ExchangePlaidPublicTokenBody.parse(req.body);
    const data = ExchangePlaidPublicTokenResponse.parse({
      itemId: `item-sandbox-${Math.random().toString(36).slice(2, 10)}`,
      institutionName: input.institutionName ?? "Chase Sandbox",
      mask: String(Math.floor(1000 + Math.random() * 9000)),
      accountType: "credit",
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
