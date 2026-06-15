import type { DashboardTab } from "@/components/dashboard/DashboardTabBar";

/** Default tab after login, signup, and bare `/dashboard` URLs. */
export const DEFAULT_CABINET_TAB: DashboardTab = "dashboard";

export const DEFAULT_CABINET_PATH = "/dashboard?tab=dashboard";

/** Canonical cabinet tab URLs (aligned with PWA manifest scope `/dashboard`). */
export function dashboardTabPath(tab: DashboardTab): string {
  return tab === "dashboard" ? "/dashboard?tab=dashboard" : "/dashboard?tab=home";
}

export function parseDashboardTab(search: string): DashboardTab {
  const tab = new URLSearchParams(search).get("tab");
  if (tab === "home") return "home";
  return "dashboard";
}
