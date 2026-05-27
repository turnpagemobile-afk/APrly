import { notifyCabinetSwNeedRefresh } from "@/lib/pwa/cabinet-sw-refresh";

type ReloadCabinetSw = (reloadPage?: boolean) => Promise<void>;

let reloadCabinetSw: ReloadCabinetSw | null = null;
let controllerChangeListenerAttached = false;
let cabinetReloadInFlight = false;

export function isCabinetStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone =
    "standalone" in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return (
    iosStandalone ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}

export function setCabinetSwReloader(reloader: ReloadCabinetSw): void {
  reloadCabinetSw = reloader;
}

function scheduleCabinetReload(): void {
  if (cabinetReloadInFlight) return;
  cabinetReloadInFlight = true;
  window.location.reload();
}

/** Activate waiting worker and reload to pick up new precached assets. */
export async function applyCabinetSwUpdate(): Promise<void> {
  if (cabinetReloadInFlight) return;
  cabinetReloadInFlight = true;
  if (reloadCabinetSw) {
    await reloadCabinetSw(true);
    return;
  }
  scheduleCabinetReload();
}

/**
 * New build ready. Installed PWA: reload on first open/online; browser tab: show banner.
 */
export function handleCabinetSwUpdateReady(): void {
  if (isCabinetStandalone()) {
    void applyCabinetSwUpdate();
    return;
  }
  notifyCabinetSwNeedRefresh();
}

/** After skipWaiting, load assets from the new service worker. */
export function listenForCabinetControllerChange(): void {
  if (controllerChangeListenerAttached || typeof navigator === "undefined") {
    return;
  }
  if (!("serviceWorker" in navigator)) return;

  controllerChangeListenerAttached = true;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    scheduleCabinetReload();
  });
}

function nudgeWaitingWorker(registration: ServiceWorkerRegistration): void {
  const waiting = registration.waiting;
  if (!waiting || !navigator.serviceWorker.controller) return;
  waiting.postMessage({ type: "SKIP_WAITING" });
}

/**
 * Poll for a new `/dashboard/sw.js` when the app resumes or comes online.
 * With `registerType: autoUpdate`, a new worker uses skipWaiting → controllerchange → reload.
 */
export function scheduleCabinetSwUpdateChecks(
  registration: ServiceWorkerRegistration,
): void {
  const check = () => {
    void registration
      .update()
      .then(() => {
        nudgeWaitingWorker(registration);
        if (registration.waiting && isCabinetStandalone()) {
          void applyCabinetSwUpdate();
        }
      })
      .catch(() => {});
  };

  window.addEventListener("online", check);
  window.addEventListener("focus", check);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) check();
  });

  window.setTimeout(check, 2_000);
  window.setInterval(check, 60 * 60 * 1000);

  check();
}
