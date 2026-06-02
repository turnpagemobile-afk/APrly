import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { releaseDialogScrollLock } from "@/lib/release-dialog-scroll-lock";

export type AuthOverlayShellProps = {
  open: boolean;
  onDismiss: () => void;
  /** When false, backdrop click and Escape do not dismiss */
  allowDismiss?: boolean;
  panelClassName?: string;
  children: ReactNode;
};

export function AuthOverlayShell({
  open,
  onDismiss,
  allowDismiss = true,
  panelClassName,
  children,
}: AuthOverlayShellProps) {
  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && allowDismiss) {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      releaseDialogScrollLock();
    };
  }, [open, allowDismiss, onDismiss]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="notranslate" translate="no" lang="en">
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
        <button
          type="button"
          aria-label="Close"
          className="absolute inset-0 bg-black/80"
          tabIndex={-1}
          onClick={() => {
            if (allowDismiss) onDismiss();
          }}
        />
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative z-10 grid w-[calc(100%-2rem)] max-w-md max-h-[min(90dvh,100%)] gap-4 overflow-y-auto overscroll-contain rounded-2xl border border-[var(--card-border-color)] bg-[var(--card-1lvl-bg-color)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[var(--neutral-theme-900)] shadow-lg cabinet:p-8",
            "sm:w-full sm:max-h-none sm:pb-6",
            panelClassName,
          )}
        >
          {allowDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="absolute right-4 top-4 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          ) : null}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
