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
