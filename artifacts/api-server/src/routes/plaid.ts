import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  AccountSubtype,
  AccountType,
  APRAprTypeEnum,
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
  type CreditCardLiability,
} from "plaid";
import {
  CreatePlaidLinkTokenResponse,
  ExchangePlaidPublicTokenBody,
  ExchangePlaidPublicTokenResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function plaidConfigured(): boolean {
  return !!(
    process.env["PLAID_CLIENT_ID"]?.trim() && process.env["PLAID_SECRET"]?.trim()
  );
}

function plaidBasePath(): string {
  const env = process.env["PLAID_ENV"]?.trim().toLowerCase();
  if (env === "production") return PlaidEnvironments.production;
  return PlaidEnvironments.sandbox;
}

function getPlaidClient(): PlaidApi {
  const clientId = process.env["PLAID_CLIENT_ID"]!;
  const secret = process.env["PLAID_SECRET"]!;
  return new PlaidApi(
    new Configuration({
      basePath: plaidBasePath(),
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": clientId,
          "PLAID-SECRET": secret,
        },
      },
    }),
  );
}

function isLocalFrontendOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function plaidRedirectUri(): string | undefined {
  const explicit = process.env["PLAID_REDIRECT_URI"]?.trim();
  if (explicit) return explicit;
  const origin = process.env["FRONTEND_ORIGIN"]?.trim().replace(/\/+$/, "");
  if (!origin || isLocalFrontendOrigin(origin)) return undefined;
  return `${origin}/plaid/oauth`;
}

function plaidApiErrorResponse(
  err: unknown,
): { status: number; message: string } | null {
  if (!err || typeof err !== "object" || !("response" in err)) return null;
  const response = (err as { response?: { status?: number; data?: unknown } })
    .response;
  if (!response?.data || typeof response.data !== "object") return null;

  const data = response.data as Record<string, unknown>;
  const message =
    (typeof data.error_message === "string" && data.error_message) ||
    (typeof data.display_message === "string" && data.display_message) ||
    (typeof data.error === "string" && data.error) ||
    "Plaid request failed";

  const status =
    response.status != null && response.status >= 400 && response.status < 600
      ? response.status
      : 502;

  return { status, message };
}

function pickPurchaseApr(liab: CreditCardLiability | undefined): number | undefined {
  if (!liab?.aprs?.length) return undefined;
  const purchase = liab.aprs.find((a) => a.apr_type === APRAprTypeEnum.PurchaseApr);
  const pct = purchase?.apr_percentage ?? liab.aprs[0]?.apr_percentage;
  return pct != null && Number.isFinite(pct) ? pct : undefined;
}

router.post("/plaid/link-token", async (_req, res, next) => {
  try {
    if (!plaidConfigured()) {
      res.status(503).json({
        error:
          "Plaid is not configured. Set PLAID_CLIENT_ID and PLAID_SECRET in .env.",
      });
      return;
    }

    const client = getPlaidClient();
    const redirectUri = plaidRedirectUri();

    const tokenRes = await client.linkTokenCreate({
      user: { client_user_id: randomUUID() },
      client_name: "APrly",
      link_customization_name: "default",
      // Transactions + Liabilities: broader institution support in Link; Liabilities alone can fail Link init for some flows.
      products: [Products.Transactions, Products.Liabilities],
      country_codes: [CountryCode.Us],
      language: "en",
      ...(redirectUri ? { redirect_uri: redirectUri } : {}),
    });

    const linkToken = tokenRes.data.link_token;
    if (linkToken.length < 40) {
      logger.warn(
        { linkTokenLength: linkToken.length, requestId: tokenRes.data.request_id },
        "link_token looks unusually short; confirm api-server uses real Plaid credentials (not an old mock).",
      );
    }
    const expiration = tokenRes.data.expiration ?? new Date().toISOString();

    const data = CreatePlaidLinkTokenResponse.parse({
      linkToken,
      expiration,
      sandbox: plaidBasePath() === PlaidEnvironments.sandbox,
      redirectUri: redirectUri ?? null,
    });
    res.json(data);
  } catch (err) {
    const plaidErr = plaidApiErrorResponse(err);
    if (plaidErr) {
      res.status(plaidErr.status).json({ error: plaidErr.message });
      return;
    }
    next(err);
  }
});

router.post("/plaid/exchange", async (req, res, next) => {
  try {
    const input = ExchangePlaidPublicTokenBody.parse(req.body);

    if (!plaidConfigured()) {
      res.status(503).json({
        error:
          "Plaid is not configured. Set PLAID_CLIENT_ID and PLAID_SECRET in .env.",
      });
      return;
    }

    const client = getPlaidClient();
    const exchangeRes = await client.itemPublicTokenExchange({
      public_token: input.publicToken,
    });

    const accessToken = exchangeRes.data.access_token;
    const itemId = exchangeRes.data.item_id;

    const liabRes = await client.liabilitiesGet({
      access_token: accessToken,
    });

    const institutionName =
      input.institutionName?.trim() ||
      liabRes.data.item.institution_name?.trim() ||
      "Linked institution";

    const creditLiabs = liabRes.data.liabilities.credit ?? [];
    const byAccountId = new Map<string, CreditCardLiability>();
    for (const c of creditLiabs) {
      if (c.account_id) byAccountId.set(c.account_id, c);
    }

    const importedCards: {
      brand: string;
      balance: number;
      rate: number;
      accountId?: string;
    }[] = [];

    for (const acc of liabRes.data.accounts) {
      if (acc.type !== AccountType.Credit || acc.subtype !== AccountSubtype.CreditCard) {
        continue;
      }
      if (!acc.account_id) continue;

      const liab = byAccountId.get(acc.account_id);
      const rate = pickPurchaseApr(liab);
      if (rate == null || rate <= 0) continue;

      const balance = acc.balances?.current;
      if (balance == null || !Number.isFinite(balance) || balance <= 0) continue;

      const brand =
        (acc.official_name || acc.name || "Credit card").trim() +
        (acc.mask ? ` · ${acc.mask}` : "");

      importedCards.push({
        brand,
        balance: Math.round(balance * 100) / 100,
        rate: Math.round(rate * 100) / 100,
        accountId: acc.account_id,
      });
    }

    const firstId = importedCards[0]?.accountId;
    const firstMask =
      (firstId &&
        liabRes.data.accounts.find((a) => a.account_id === firstId)?.mask) ||
      "----";

    const data = ExchangePlaidPublicTokenResponse.parse({
      itemId,
      institutionName: String(institutionName),
      mask: firstMask || "----",
      accountType: "credit",
      importedCards,
    });
    res.json(data);
  } catch (err) {
    const plaidErr = plaidApiErrorResponse(err);
    if (plaidErr) {
      res.status(plaidErr.status).json({ error: plaidErr.message });
      return;
    }
    next(err);
  }
});

export default router;
