import { useState } from "react";
import { X } from "lucide-react";
import { dashboardPromoContent } from "@/content/dashboard-home";
import { useCabinetPwaContext } from "@/lib/pwa/cabinet-pwa-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "aprly-cabinet-app-banner-dismissed";

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

type CabinetAppBannerProps = {
  subscriptionActive: boolean;
};

export function CabinetAppBanner({ subscriptionActive }: CabinetAppBannerProps) {
  const [dismissed, setDismissed] = useState(readDismissed);
  const [iosDialogOpen, setIosDialogOpen] = useState(false);
  const {
    isStandalone,
    isOffline,
    canInstall,
    showIosInstallHint,
    promptInstall,
  } = useCabinetPwaContext();

  if (dismissed) return null;

  const installActionReady = canInstall || showIosInstallHint;
  const downloadDisabled =
    !subscriptionActive ||
    isOffline ||
    isStandalone ||
    !installActionReady;

  const disabledTitle = !subscriptionActive
    ? dashboardPromoContent.disabledNoSubscription
    : isOffline
      ? dashboardPromoContent.disabledOffline
      : !installActionReady
        ? dashboardPromoContent.disabledInstallUnavailable
        : undefined;

  const downloadLabel = isStandalone
    ? dashboardPromoContent.ctaInstalled
    : showIosInstallHint
      ? dashboardPromoContent.ctaIos
      : dashboardPromoContent.cta.label;

  const onDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const onDownload = async () => {
    if (downloadDisabled) return;
    if (showIosInstallHint) {
      setIosDialogOpen(true);
      return;
    }
    if (canInstall) {
      await promptInstall();
    }
  };

  return (
    <>
      <div
        className={cn(
          "relative border-b border-[var(--info-theme-300)] bg-[var(--info-theme-100)]",
          "px-4 py-3 bp600:px-6",
        )}
      >
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3 rounded-sm text-primary opacity-80 transition-opacity hover:opacity-100 bp600:right-4"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-start gap-3 pr-8 bp840:flex-row bp840:items-center bp840:justify-between bp840:gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-wide text-[var(--neutral-theme-900)] bp600:text-base">
              {dashboardPromoContent.bannerTitle}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--hint-text-color)] bp600:text-sm">
              {dashboardPromoContent.bannerBody}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="shrink-0 font-bold uppercase tracking-wide"
            disabled={downloadDisabled}
            title={disabledTitle}
            onClick={() => void onDownload()}
          >
            {downloadLabel}
          </Button>
        </div>
      </div>

      <Dialog open={iosDialogOpen} onOpenChange={setIosDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{dashboardPromoContent.iosInstallTitle}</DialogTitle>
            <DialogDescription asChild>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-left text-sm text-muted-foreground">
                {dashboardPromoContent.iosInstallSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
