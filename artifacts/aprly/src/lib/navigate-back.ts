import { useCallback } from "react";
import { useLocation } from "wouter";

/** Navigate to previous history entry, or fallback path when there is no back stack. */
export function navigateBack(setLocation: (path: string) => void, fallback = "/") {
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
    return;
  }
  setLocation(fallback);
}

export function useNavigateBack(fallback = "/") {
  const [, setLocation] = useLocation();
  return useCallback(() => navigateBack(setLocation, fallback), [setLocation, fallback]);
}
