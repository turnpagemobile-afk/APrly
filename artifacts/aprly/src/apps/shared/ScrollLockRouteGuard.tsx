import { useEffect } from "react";
import { useLocation } from "wouter";
import { isLandingMarketingPath } from "@/lib/landing-document-theme";
import { releaseDialogScrollLock } from "@/lib/release-dialog-scroll-lock";
import { scrollToTopIfScrollable } from "@/lib/scroll-to-top";

export function ScrollLockRouteGuard() {
  const [location] = useLocation();
  useEffect(() => {
    releaseDialogScrollLock();
    if (isLandingMarketingPath(location)) {
      scrollToTopIfScrollable();
    }
  }, [location]);
  return null;
}
