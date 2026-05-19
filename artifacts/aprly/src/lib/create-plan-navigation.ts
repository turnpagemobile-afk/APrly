export const CREATE_PLAN_PATH = "/dashboard/create-plan";

export function createPlanHref(returnTo: string): string {
  return `${CREATE_PLAN_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function readCreatePlanReturnTo(search: string): string {
  const raw = new URLSearchParams(search).get("returnTo");
  const fallback = "/dashboard";
  if (!raw || !raw.startsWith("/dashboard")) return fallback;
  return raw;
}
