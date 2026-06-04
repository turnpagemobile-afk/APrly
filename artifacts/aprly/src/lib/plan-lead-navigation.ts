export function planLeadHref(
  id: number,
  returnTo: string,
  options?: { addCard?: boolean; planIndex?: number },
): string {
  const params = new URLSearchParams({ returnTo });
  if (options?.addCard) params.set("addCard", "1");
  if (options?.planIndex != null && options.planIndex > 0) {
    params.set("planIndex", String(options.planIndex));
  }
  return `/dashboard/plan-leads/${id}?${params.toString()}`;
}

export function readPlanLeadPlanIndex(search: string): number {
  const raw = new URLSearchParams(search).get("planIndex");
  const n = raw ? Number(raw) : 1;
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function readPlanLeadAddCard(search: string): boolean {
  return new URLSearchParams(search).get("addCard") === "1";
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
