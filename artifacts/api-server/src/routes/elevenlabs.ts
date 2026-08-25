import { Router, type IRouter, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SIGNED_URL_ENDPOINT =
  "https://api.elevenlabs.io/v1/convai/conversation/get_signed_url";

function frontendOriginBase(): string {
  return (process.env["FRONTEND_ORIGIN"] ?? "http://localhost:5173").replace(/\/+$/, "");
}

/** Origins allowed to request a Bit conversation signed URL. */
export function elevenLabsAllowedOrigins(): Set<string> {
  return new Set([
    frontendOriginBase(),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://dev.aprly.ai",
    "https://aprly.ai",
    "https://www.aprly.ai",
  ]);
}

const LOCAL_DEV_HOSTS = new Set(["localhost:5173", "127.0.0.1:5173"]);

function normalizeOrigin(value: string): string {
  return value.replace(/\/+$/, "");
}

function originInAllowlist(origin: string): boolean {
  return elevenLabsAllowedOrigins().has(normalizeOrigin(origin));
}

/**
 * Same-origin fetches via the Vite `/api` proxy often omit `Origin`,
 * or the proxy may rewrite Origin to the API host. Accept allowlisted
 * Origin first; otherwise fall back to Sec-Fetch-Site / Referer /
 * forwarded Host.
 */
export function isAllowedSignedUrlRequest(req: Request): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  if (origin && originInAllowlist(origin)) {
    return true;
  }

  const secFetchSite = req.headers["sec-fetch-site"];
  if (secFetchSite === "same-origin") {
    return true;
  }

  const referer = typeof req.headers.referer === "string" ? req.headers.referer : undefined;
  if (referer) {
    try {
      const refererOrigin = normalizeOrigin(new URL(referer).origin);
      if (originInAllowlist(refererOrigin)) {
        return true;
      }
    } catch {
      // ignore invalid Referer
    }
  }

  const forwardedHostRaw = req.headers["x-forwarded-host"];
  const forwardedHost =
    typeof forwardedHostRaw === "string"
      ? forwardedHostRaw.split(",")[0]?.trim()
      : undefined;
  const host = typeof req.headers.host === "string" ? req.headers.host : undefined;
  if (
    (forwardedHost && LOCAL_DEV_HOSTS.has(forwardedHost)) ||
    (host && LOCAL_DEV_HOSTS.has(host))
  ) {
    return true;
  }

  return false;
}

function agentId(): string | undefined {
  const id = process.env["AI_ASSISSTANT_ID"]?.trim();
  return id || undefined;
}

function apiKey(): string | undefined {
  const key = process.env["ELEVENLABS_API_KEY"]?.trim();
  return key || undefined;
}

const signedUrlRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many assistant session requests. Please try again later." },
});

router.get(
  "/ai/elevenlabs-signed-url",
  signedUrlRateLimit,
  async (req: Request, res: Response) => {
    if (!isAllowedSignedUrlRequest(req)) {
      res.status(403).json({ error: "Origin not allowed" });
      return;
    }

    const key = apiKey();
    const id = agentId();
    if (!key || !id) {
      logger.error(
        { hasKey: Boolean(key), hasAgentId: Boolean(id) },
        "ElevenLabs signed URL misconfigured",
      );
      res.status(503).json({ error: "Voice assistant is not configured" });
      return;
    }

    try {
      const url = new URL(SIGNED_URL_ENDPOINT);
      url.searchParams.set("agent_id", id);

      const upstream = await fetch(url, {
        method: "GET",
        headers: { "xi-api-key": key },
      });

      if (!upstream.ok) {
        const body = await upstream.text().catch(() => "");
        logger.warn(
          { status: upstream.status, body: body.slice(0, 200) },
          "ElevenLabs get_signed_url failed",
        );
        res.status(502).json({ error: "Failed to start assistant session" });
        return;
      }

      const data = (await upstream.json()) as { signed_url?: string };
      if (!data.signed_url || typeof data.signed_url !== "string") {
        res.status(502).json({ error: "Invalid assistant session response" });
        return;
      }

      res.json({ signedUrl: data.signed_url });
    } catch (err) {
      logger.error({ err }, "ElevenLabs signed URL request error");
      res.status(502).json({ error: "Failed to start assistant session" });
    }
  },
);

export default router;
