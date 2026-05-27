/**
 * Cross-SPA navigation (landing / cabinet / admin are separate Vite apps).
 * Wouter `navigate()` only switches routes inside the current bundle — use these
 * helpers when leaving one app for another.
 */

/** Cabinet Vite build uses `base: /dashboard/` — require trailing slash before `?`. */
export function normalizeCabinetUrl(path: string): string {
  const q = path.indexOf("?");
  const pathname = q === -1 ? path : path.slice(0, q);
  const search = q === -1 ? "" : path.slice(q);
  if (pathname === "/dashboard") {
    return `/dashboard/${search}`;
  }
  return path;
}

export function goToCabinet(path = "/dashboard?tab=home"): void {
  window.location.assign(normalizeCabinetUrl(path));
}

export function goToLanding(path = "/"): void {
  window.location.assign(path);
}

/** Admin Vite build uses `base: /admin/`. */
export function normalizeAdminUrl(path: string): string {
  const q = path.indexOf("?");
  const pathname = q === -1 ? path : path.slice(0, q);
  const search = q === -1 ? "" : path.slice(q);
  if (pathname === "/admin") {
    return `/admin/${search}`;
  }
  return path;
}

export function goToAdmin(path = "/admin/dashboard"): void {
  window.location.assign(normalizeAdminUrl(path));
}
