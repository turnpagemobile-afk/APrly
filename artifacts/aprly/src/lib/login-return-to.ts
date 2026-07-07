import { DEFAULT_CABINET_PATH } from "./dashboard-tab-url";

export function readLoginReturnTo(search: string): string {
  const raw = new URLSearchParams(search).get("returnTo");
  if (!raw || !raw.startsWith("/dashboard")) return DEFAULT_CABINET_PATH;
  return raw;
}

export function loginHref(returnTo: string): string {
  return `/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function currentReturnToPath(): string {
  return `${window.location.pathname}${window.location.search}`;
}
