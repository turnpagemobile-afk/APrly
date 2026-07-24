import { goToCabinet, goToLanding } from "@/lib/app-navigation";

/** Allowed paths for Bit client tool `navigateTo` (must match agent tool config). */
export const BIT_NAVIGATE_ALLOWLIST = [
  "/",
  "/#optimizer",
  "/#faq",
  "/terms",
  "/privacy",
  "/login",
  "/dashboard",
  "/dashboard?tab=dashboard",
  "/dashboard?tab=home",
  "/dashboard/profile",
  "/dashboard/create-plan",
] as const;

export type BitNavigatePath = (typeof BIT_NAVIGATE_ALLOWLIST)[number];

export function isAllowedBitNavigatePath(path: string): path is BitNavigatePath {
  return (BIT_NAVIGATE_ALLOWLIST as readonly string[]).includes(path);
}

function currentApp(): "landing" | "cabinet" | "admin" | "mono" {
  if (typeof __APRLY_APP__ === "undefined") return "mono";
  return __APRLY_APP__;
}

/**
 * Apply an allowlisted Bit navigation path using wouter setLocation,
 * hash scroll, or cross-SPA hard navigation when needed.
 */
export function applyBitNavigate(
  path: string,
  setLocation: (to: string) => void,
): { ok: true; path: string } | { ok: false; error: string } {
  if (!isAllowedBitNavigatePath(path)) {
    return { ok: false, error: `Path not allowed: ${path}` };
  }

  const app = currentApp();

  if (path.startsWith("/dashboard")) {
    const cabinetPath = path === "/dashboard" ? "/dashboard?tab=dashboard" : path;
    if (app === "landing") {
      goToCabinet(cabinetPath);
      return { ok: true, path };
    }
    setLocation(cabinetPath);
    return { ok: true, path };
  }

  if (app === "cabinet") {
    goToLanding(path === "/#optimizer" || path === "/#faq" ? `/${path.slice(1)}` : path);
    return { ok: true, path };
  }

  if (path === "/") {
    setLocation("/");
    return { ok: true, path };
  }

  if (path.startsWith("/#")) {
    const hash = path.slice(1);
    const id = hash.slice(1);
    setLocation("/");
    queueMicrotask(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.location.hash = hash;
    });
    return { ok: true, path };
  }

  setLocation(path);
  return { ok: true, path };
}
