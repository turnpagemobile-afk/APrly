import crypto from "node:crypto";
import type { Response } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, refreshTokensTable } from "@workspace/db";

export const ACCESS_COOKIE = "aprly_access";
export const REFRESH_COOKIE = "aprly_refresh";

function jwtSecret(): string {
  const s = process.env["JWT_SECRET"];
  if (!s) {
    throw new Error("JWT_SECRET is required");
  }
  return s;
}

export function hashRefreshToken(raw: string): string {
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}

export function signAccessToken(userId: number, role: string): string {
  const ttl = Number(process.env["JWT_ACCESS_TTL_SEC"] ?? "900");
  return jwt.sign({ sub: String(userId), role, typ: "access" }, jwtSecret(), {
    expiresIn: ttl,
    algorithm: "HS256",
  });
}

const ADMIN_OTP_TTL_SEC = 600;

export function signAdminOtpChallengeToken(userId: number): string {
  return jwt.sign({ sub: String(userId), typ: "admin_otp_pending" }, jwtSecret(), {
    expiresIn: ADMIN_OTP_TTL_SEC,
    algorithm: "HS256",
  });
}

export function verifyAdminOtpChallengeToken(
  token: string,
): { userId: number } | null {
  try {
    const payload = jwt.verify(token, jwtSecret(), {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload;
    if (payload["typ"] !== "admin_otp_pending" || typeof payload["sub"] !== "string") {
      return null;
    }
    const userId = Number(payload["sub"]);
    if (!Number.isFinite(userId) || userId < 1) {
      return null;
    }
    return { userId };
  } catch {
    return null;
  }
}

export function adminOtpExpiresInSeconds(): number {
  return ADMIN_OTP_TTL_SEC;
}

export function verifyAccessToken(token: string): { userId: number; role: string } | null {
  try {
    const payload = jwt.verify(token, jwtSecret(), {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload;
    if (payload["typ"] !== "access" || typeof payload["sub"] !== "string") {
      return null;
    }
    const userId = Number(payload["sub"]);
    if (!Number.isFinite(userId)) {
      return null;
    }
    return { userId, role: String(payload["role"] ?? "user") };
  } catch {
    return null;
  }
}

function cookieBase() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env["NODE_ENV"] === "production",
  };
}

export async function revokeRefreshTokensForUser(userId: number): Promise<void> {
  await db.delete(refreshTokensTable).where(eq(refreshTokensTable.userId, userId));
}

export async function issueAuthCookies(res: Response, userId: number, role: string): Promise<void> {
  await revokeRefreshTokensForUser(userId);

  const access = signAccessToken(userId, role);
  const rawRefresh = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashRefreshToken(rawRefresh);
  const refreshDays = Number(process.env["JWT_REFRESH_TTL_DAYS"] ?? "30");
  const expiresAt = new Date(Date.now() + refreshDays * 86_400_000);

  await db.insert(refreshTokensTable).values({
    userId,
    tokenHash,
    expiresAt,
  });

  const base = cookieBase();
  const accessTtl = Number(process.env["JWT_ACCESS_TTL_SEC"] ?? "900");
  res.cookie(ACCESS_COOKIE, access, { ...base, maxAge: accessTtl * 1000 });
  res.cookie(REFRESH_COOKIE, rawRefresh, { ...base, maxAge: refreshDays * 86_400_000 });
}

export function clearAuthCookies(res: Response): void {
  const base = cookieBase();
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
}
