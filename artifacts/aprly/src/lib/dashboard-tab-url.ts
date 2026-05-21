import type { DashboardTab } from "@/components/dashboard/DashboardTabBar";

/** Canonical cabinet tab URLs (aligned with PWA manifest scope `/dashboard`). */
export function dashboardTabPath(tab: DashboardTab): string {
  return tab === "dashboard" ? "/dashboard?tab=dashboard" : "/dashboard?tab=home";
}

export function parseDashboardTab(search: string): DashboardTab {
  const tab = new URLSearchParams(search).get("tab");
  if (tab === "dashboard") return "dashboard";
  return "home";
}
