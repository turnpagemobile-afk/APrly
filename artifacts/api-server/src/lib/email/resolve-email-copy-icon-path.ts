import fs from "node:fs";
import path from "node:path";

export function resolveEmailCopyIconPath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    process.env["APRLY_EMAIL_COPY_ICON_PATH"],
    path.join(cwd, "assets", "email", "copy.svg"),
    path.join(cwd, "artifacts", "api-server", "assets", "email", "copy.svg"),
    path.resolve(cwd, "..", "..", "artifacts", "api-server", "assets", "email", "copy.svg"),
  ].filter((p): p is string => Boolean(p?.trim()));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}
