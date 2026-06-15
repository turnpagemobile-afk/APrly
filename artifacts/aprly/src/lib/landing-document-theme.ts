/** Force light Figma tokens on <html> (mono dev uses dark by default). */

export function applyLandingLightDocumentTheme(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark");
  root.classList.add("light");
  root.style.colorScheme = "light";
}

export function applyDarkDocumentTheme(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light");
  root.classList.add("dark");
  root.style.colorScheme = "dark";
}

export function isLandingMarketingPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/login" || pathname === "/reset-password") return true;
  if (pathname === "/privacy" || pathname === "/terms") return true;
  return false;
}

/** Routes rendered inside DashboardShell (footer comes from the shell, not Layout). */
export function isCabinetShellPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
