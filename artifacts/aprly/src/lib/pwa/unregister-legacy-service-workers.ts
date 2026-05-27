const CABINET_SW_SEGMENT = "/dashboard/sw.js";

function isCabinetServiceWorker(reg: ServiceWorkerRegistration): boolean {
  const scriptUrl =
    reg.active?.scriptURL ??
    reg.installing?.scriptURL ??
    reg.waiting?.scriptURL ??
    "";
  if (scriptUrl.includes(CABINET_SW_SEGMENT)) {
    return true;
  }
  try {
    const scopePath = new URL(reg.scope).pathname;
    return scopePath === "/dashboard/" || scopePath.startsWith("/dashboard/");
  } catch {
    return false;
  }
}

/**
 * Remove site-wide (mono-era) service workers. They precached `/dashboard/*`
 * and keep serving old cabinet UI after multi-SPA deploy; landing has no SW.
 */
export async function unregisterLegacyServiceWorkers(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((reg) => !isCabinetServiceWorker(reg))
        .map((reg) => reg.unregister()),
    );
  } catch {
    // Best-effort cleanup; app must still load if this fails.
  }
}
