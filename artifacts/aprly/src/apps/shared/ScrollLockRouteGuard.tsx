import { useEffect } from "react";
import { useLocation } from "wouter";
import { releaseDialogScrollLock } from "@/lib/release-dialog-scroll-lock";

export function ScrollLockRouteGuard() {
  const [location] = useLocation();
  useEffect(() => {
    releaseDialogScrollLock();
  }, [location]);
  return null;
}
