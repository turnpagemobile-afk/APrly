import { useEffect, useState } from "react";
import { dashboardPromoContent } from "@/content/dashboard-home";
import { PillButton } from "@/components/shared/PillButton";
import { useAuth } from "@/lib/auth-session";
import { useCabinetPwaContext } from "@/lib/pwa/cabinet-pwa-context";
import { dashDialogRadiusClassName } from "@/lib/dashboard-dialog-styles";
import { sharedAsset } from "@/lib/shared-assets";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function dismissKey(userId: number): string {
  return `aprly-cabinet-app-banner-dismissed:${userId}`;
}

function readDismissed(userId: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(dismissKey(userId)) === "1";
  } catch {
    return false;
  }
}

type CabinetAppBannerProps = {
  subscriptionActive: boolean;
};

export function CabinetAppBanner({ subscriptionActive }: CabinetAppBannerProps) {
  const { user } = useAuth();
  const userId = user?.id;
  const [dismissed, setDismissed] = useState(false);
  const [iosDialogOpen, setIosDialogOpen] = useState(false);
  const {
    isStandalone,
    isOffline,
    canInstall,
    showIosInstallHint,
    promptInstall,
  } = useCabinetPwaContext();

  useEffect(() => {
    if (userId == null) return;
    setDismissed(readDismissed(userId));
  }, [userId]);

  if (userId == null || dismissed) return null;

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
      window.localStorage.setItem(dismissKey(userId), "1");
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
      <div className="relative bg-[var(--primary-theme-600)] px-4 py-4 bp600:px-6">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center opacity-90 transition-opacity hover:opacity-100 bp600:right-4"
          aria-label="Dismiss banner"
        >
          {/* shared close.svg is white-filled (synced from close-red.svg) — correct on green banner */}
          <img src={sharedAsset("close.svg")} alt="" aria-hidden className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-start gap-3 pr-8 bp600:flex-row bp600:items-center bp600:justify-between bp600:gap-6">
          <div className="max-w-2xl">
            <p className="app-header-screen-title-bold text-neutral-000">
              {dashboardPromoContent.bannerTitle}
            </p>
            <p className="app-text-p1-regular text-neutral-000 mt-1 leading-relaxed">
              {dashboardPromoContent.bannerBody}
            </p>
          </div>
          <PillButton
            type="button"
            variant="special"
            size="default"
            className="shrink-0"
            disabled={downloadDisabled}
            title={disabledTitle}
            onClick={() => void onDownload()}
          >
            {downloadLabel}
          </PillButton>
        </div>
      </div>

      <Dialog open={iosDialogOpen} onOpenChange={setIosDialogOpen}>
        <DialogContent className={cn("max-w-sm", dashDialogRadiusClassName)}>
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
