import { registerSW } from "virtual:pwa-register";
import {
  handleCabinetSwUpdateReady,
  listenForCabinetControllerChange,
  scheduleCabinetSwUpdateChecks,
  setCabinetSwReloader,
} from "@/lib/pwa/cabinet-sw-update";

let registered = false;

/** Register the cabinet PWA service worker (call from dashboard routes only). */
export function registerCabinetSw(): void {
  if (registered || typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  registered = true;
  listenForCabinetControllerChange();

  const reload = registerSW({
    immediate: true,
    onNeedRefresh() {
      handleCabinetSwUpdateReady();
    },
    onRegisteredSW(_swScriptUrl, registration) {
      if (registration) scheduleCabinetSwUpdateChecks(registration);
    },
  });

  setCabinetSwReloader(reload);
}
