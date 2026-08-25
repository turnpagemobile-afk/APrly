import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { customFetch } from "@workspace/api-client-react/custom-fetch";
import { applyBitNavigate } from "@/lib/bit-navigate";
import { applyBitFill } from "@/lib/bit-fill";
import { applyBitOpenForm } from "@/lib/bit-ui-actions";
import { goToLanding } from "@/lib/app-navigation";

const WIDGET_SCRIPT_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";
const SCRIPT_ATTR = "data-elevenlabs-convai-embed";
const SIGNED_URL_PATH = "/api/ai/elevenlabs-signed-url";
/** Refresh signed URL before typical 15m expiry. */
const SIGNED_URL_REFRESH_MS = 10 * 60 * 1000;

type SignedUrlResponse = { signedUrl: string };

type ConvaiCallDetail = {
  config: {
    clientTools?: Record<string, (params: Record<string, string>) => unknown>;
  };
};

function loadWidgetScript(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const existing = document.querySelector(`script[${SCRIPT_ATTR}]`);
  if (existing) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.type = "text/javascript";
    script.setAttribute(SCRIPT_ATTR, "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load ElevenLabs widget script"));
    document.body.appendChild(script);
  });
}

async function fetchSignedUrl(): Promise<string> {
  const data = await customFetch<SignedUrlResponse>(SIGNED_URL_PATH, {
    method: "GET",
  });
  if (!data?.signedUrl) {
    throw new Error("Missing signedUrl");
  }
  return data.signedUrl;
}

function navigateToLogin(setLocation: (to: string) => void): void {
  if (typeof __APRLY_APP__ !== "undefined" && __APRLY_APP__ === "cabinet") {
    goToLanding("/login");
    return;
  }
  setLocation("/login");
}

/**
 * Official ElevenLabs Convai widget for Bit (auth via server signed URL).
 * Client tools: navigateTo, openForm, fillField.
 */
export function BitConvaiWidget() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [, setLocation] = useLocation();
  const setLocationRef = useRef(setLocation);
  setLocationRef.current = setLocation;

  useEffect(() => {
    let cancelled = false;
    let refreshTimer: ReturnType<typeof setInterval> | null = null;
    let widgetEl: HTMLElement | null = null;

    const applySignedUrl = async () => {
      if (!widgetEl || cancelled) return;
      try {
        const signedUrl = await fetchSignedUrl();
        if (cancelled || !widgetEl) return;
        widgetEl.setAttribute("signed-url", signedUrl);
      } catch (err) {
        console.error("[BitConvaiWidget] signed URL failed", err);
      }
    };

    const onCall = (event: Event) => {
      const detail = (event as CustomEvent<ConvaiCallDetail>).detail;
      if (!detail?.config) return;
      detail.config.clientTools = {
        navigateTo: async (params: Record<string, string>) => {
          const path = params.path ?? "";
          const result = applyBitNavigate(path, setLocationRef.current);
          if (!result.ok) {
            return { success: false, error: result.error };
          }
          return { success: true, path: result.path };
        },
        openForm: async (params: Record<string, string>) => {
          const form = params.form ?? "";
          const result = applyBitOpenForm(form, () =>
            navigateToLogin(setLocationRef.current),
          );
          if (!result.ok) {
            return { success: false, error: result.error };
          }
          return { success: true, form: result.form };
        },
        fillField: async (params: Record<string, string>) => {
          const fieldId = params.fieldId ?? "";
          const value = params.value ?? "";
          const result = applyBitFill(fieldId, value);
          if (!result.ok) {
            return { success: false, error: result.error };
          }
          return { success: true, fieldId: result.fieldId };
        },
      };
      void applySignedUrl();
    };

    void (async () => {
      const host = hostRef.current;
      if (!host) return;

      try {
        await loadWidgetScript();
        if (cancelled || !hostRef.current) return;

        widgetEl = document.createElement("elevenlabs-convai");
        widgetEl.setAttribute("action-text", "Talk to Bit");
        widgetEl.setAttribute("start-call-text", "Start call");
        widgetEl.setAttribute("end-call-text", "End call");
        widgetEl.setAttribute("expand-text", "Chat with Bit");
        widgetEl.setAttribute("collapse-text", "Close");
        host.appendChild(widgetEl);

        await applySignedUrl();
        widgetEl.addEventListener("elevenlabs-convai:call", onCall);
        refreshTimer = setInterval(() => {
          void applySignedUrl();
        }, SIGNED_URL_REFRESH_MS);
      } catch (err) {
        console.error("[BitConvaiWidget] init failed", err);
      }
    })();

    return () => {
      cancelled = true;
      if (refreshTimer) clearInterval(refreshTimer);
      if (widgetEl) {
        widgetEl.removeEventListener("elevenlabs-convai:call", onCall);
        widgetEl.remove();
      }
    };
  }, []);

  return <div ref={hostRef} className="contents" aria-hidden={false} />;
}
