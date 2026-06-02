import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useLocation } from "wouter";
import {
  applyDarkDocumentTheme,
  applyLandingLightDocumentTheme,
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
      if (isLandingMarketingPath(location)) {
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
