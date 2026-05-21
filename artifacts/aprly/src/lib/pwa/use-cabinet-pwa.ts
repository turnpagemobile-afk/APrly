import { useCallback, useEffect, useState } from "react";
import {
  isBeforeInstallPromptEvent,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/before-install-prompt";
import { setCabinetSwNeedRefreshHandler } from "@/lib/pwa/cabinet-sw-refresh";
import { registerCabinetSw } from "@/lib/pwa/register-cabinet-sw";
import { setupCabinetPwaHead } from "@/lib/pwa/setup-cabinet-pwa-head";

function detectIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

function detectStandalone(): boolean {
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

export function useCabinetPwa() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(detectStandalone);
  const [isIosSafari, setIsIosSafari] = useState(detectIosSafari);
  const [isOffline, setIsOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine,
  );
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    setupCabinetPwaHead();
    registerCabinetSw();
  }, []);

  useEffect(() => {
    setCabinetSwNeedRefreshHandler(() => setUpdateAvailable(true));
    return () => setCabinetSwNeedRefreshHandler(null);
  }, []);

  useEffect(() => {
    const onBip = (e: Event) => {
      if (!isBeforeInstallPromptEvent(e)) return;
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onStandalone = () => setIsStandalone(detectStandalone());
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);

    window.addEventListener("beforeinstallprompt", onBip);
    window
      .matchMedia("(display-mode: standalone)")
      .addEventListener("change", onStandalone);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window
        .matchMedia("(display-mode: standalone)")
        .removeEventListener("change", onStandalone);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const canInstall = deferredPrompt != null;
  const showIosInstallHint =
    isIosSafari && !isStandalone && !canInstall;

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  return {
    isStandalone,
    isOffline,
    updateAvailable,
    canInstall,
    showIosInstallHint,
    promptInstall,
  };
}

/** Guard online-only flows (Plaid, checkout, create plan). */
export function requireOnlineForCabinetAction(): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return false;
  }
  return true;
}
