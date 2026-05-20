/**
 * Radix Dialog can leave scroll-lock styles on document/body after close or route change
 * (common on mobile Chrome and iOS Safari). Call after closing signup modals or navigating away.
 */
export function releaseDialogScrollLock(): void {
  if (typeof document === "undefined") return;

  for (const el of [document.body, document.documentElement]) {
    el.style.overflow = "";
    el.style.pointerEvents = "";
    el.removeAttribute("data-scroll-locked");
    el.removeAttribute("data-radix-scroll-lock-scrollbar-size");
  }
}
