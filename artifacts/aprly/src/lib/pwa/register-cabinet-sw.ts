import { registerSW } from "virtual:pwa-register";

let registered = false;

/** Register the cabinet PWA service worker (call from dashboard routes only). */
export function registerCabinetSw(): void {
  if (registered || typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  registered = true;
  registerSW({ immediate: true });
}
