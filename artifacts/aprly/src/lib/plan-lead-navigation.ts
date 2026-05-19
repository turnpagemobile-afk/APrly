export function planLeadHref(id: number, returnTo: string): string {
  return `/dashboard/plan-leads/${id}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function readPlanLeadReturnTo(search: string): string {
  const raw = new URLSearchParams(search).get("returnTo");
  const fallback = "/dashboard?tab=dashboard";
  if (!raw || !raw.startsWith("/dashboard")) return fallback;
  return raw;
}

export function parsePlanLeadIdFromPath(path: string): number | null {
  const match = /^\/dashboard\/plan-leads\/(\d+)/.exec(path);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isInteger(id) && id > 0 ? id : null;
}
