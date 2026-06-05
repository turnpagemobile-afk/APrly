import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useLocation } from "wouter";
import {
  applyDarkDocumentTheme,
  applyLandingLightDocumentTheme,
  isAdminPath,
  isCabinetHomeTabPath,
  isLandingMarketingPath,
} from "@/lib/landing-document-theme";

/**
 * Ensures marketing pages use light theme even when `pnpm dev` (mono) defaults to dark.
 */
export function LandingThemeEffect() {
  const [location] = useLocation();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (__APRLY_APP__ === "landing") {
      setTheme("light");
      applyLandingLightDocumentTheme();
      return;
    }

    if (__APRLY_APP__ === "mono") {
      const [monoPath, monoSearch = ""] = location.split("?");
      const monoSearchPart = monoSearch ? `?${monoSearch}` : "";
      if (
        isLandingMarketingPath(monoPath) ||
        isCabinetHomeTabPath(monoPath, monoSearchPart) ||
        isAdminPath(monoPath)
      ) {
        setTheme("light");
        applyLandingLightDocumentTheme();
      } else {
        setTheme("dark");
        applyDarkDocumentTheme();
      }
      return;
    }

    if (__APRLY_APP__ === "admin") {
      setTheme("light");
      applyLandingLightDocumentTheme();
      return;
    }

    if (__APRLY_APP__ === "cabinet") {
      const [pathname, search = ""] = location.split("?");
      const searchPart = search ? `?${search}` : "";
      if (isCabinetHomeTabPath(pathname, searchPart)) {
        setTheme("light");
        applyLandingLightDocumentTheme();
      } else {
        setTheme("dark");
        applyDarkDocumentTheme();
      }
    }
  }, [location, setTheme]);

  return null;
}
