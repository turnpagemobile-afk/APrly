import fs from "node:fs";
import path from "node:path";

export function resolveEmailLogoPath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    process.env["APRLY_EMAIL_LOGO_PATH"],
    path.join(cwd, "assets", "email", "logo.png"),
    path.join(cwd, "artifacts", "api-server", "assets", "email", "logo.png"),
    path.resolve(cwd, "..", "..", "artifacts", "api-server", "assets", "email", "logo.png"),
  ].filter((p): p is string => Boolean(p?.trim()));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}
