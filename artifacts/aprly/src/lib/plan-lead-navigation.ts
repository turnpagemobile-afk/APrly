export function planLeadHref(
  id: number,
  returnTo: string,
  options?: { addCard?: boolean },
): string {
  const params = new URLSearchParams({ returnTo });
  if (options?.addCard) params.set("addCard", "1");
  return `/dashboard/plan-leads/${id}?${params.toString()}`;
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
