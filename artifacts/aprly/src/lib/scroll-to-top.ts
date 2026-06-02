/** Scroll to top when the document is taller than the viewport (footer/legal UX). */
export function scrollToTopIfScrollable(
  behavior: ScrollBehavior = "auto",
): void {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (root.scrollHeight > window.innerHeight) {
    window.scrollTo({ top: 0, left: 0, behavior });
  }
}
