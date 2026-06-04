const DEFAULT_RETURN_PATH = "/dashboard?tab=dashboard";
const MAX_RETURN_PATH_LENGTH = 512;

export function normalizeAuditCheckoutReturnPath(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_RETURN_PATH;
  const trimmed = raw.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > MAX_RETURN_PATH_LENGTH ||
    !trimmed.startsWith("/dashboard") ||
    trimmed.includes("://")
  ) {
    return DEFAULT_RETURN_PATH;
  }
  return trimmed;
}

export function appendCheckoutQueryParam(path: string, key: string, value: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${key}=${value}`;
}
