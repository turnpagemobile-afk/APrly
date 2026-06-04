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
  if (pathname === "/" || pathname === "/login") return true;
  if (pathname === "/privacy" || pathname === "/terms") return true;
  return false;
}

/** Routes rendered inside DashboardShell (footer comes from the shell, not Layout). */
export function isCabinetShellPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

/** Cabinet HOME tab uses landing-light visuals. */
export function isCabinetHomeTabPath(pathname: string, search: string): boolean {
  if (!pathname.startsWith("/dashboard")) return false;
  const tab = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get(
    "tab",
  );
  return tab === "home" || tab === null;
}
