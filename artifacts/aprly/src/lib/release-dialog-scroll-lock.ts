/** Time for Radix Dialog portal teardown before full-page navigation (Stripe, etc.). */
export const DIALOG_PORTAL_TEARDOWN_MS = 220;

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

/**
 * Full-page redirect after a dialog closes. Avoids calling location.assign while the
 * Radix portal is still mounted (removeChild race in React 19 / Vite overlay).
 */
export function scheduleHardNavigation(
  url: string,
  delayMs: number = DIALOG_PORTAL_TEARDOWN_MS,
): void {
  if (typeof window === "undefined") return;
  releaseDialogScrollLock();
  window.setTimeout(() => {
    releaseDialogScrollLock();
    window.location.assign(url);
  }, delayMs);
}
