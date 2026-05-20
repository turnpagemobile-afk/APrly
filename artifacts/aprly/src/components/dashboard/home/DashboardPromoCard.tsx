import { useState } from "react";
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

type DashboardPromoCardProps = {
  subscriptionActive: boolean;
};

export function DashboardPromoCard({ subscriptionActive }: DashboardPromoCardProps) {
  const {
    isStandalone,
    isOffline,
    canInstall,
    showIosInstallHint,
    promptInstall,
  } = useCabinetPwaContext();
  const [iosDialogOpen, setIosDialogOpen] = useState(false);

  const installActionReady = canInstall || showIosInstallHint;
  const disabled =
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

  const label = isStandalone
    ? dashboardPromoContent.ctaInstalled
    : showIosInstallHint
      ? dashboardPromoContent.ctaIos
      : dashboardPromoContent.cta.label;

  const handleClick = async () => {
    if (!subscriptionActive || isOffline) return;
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
      <section className="px-4 pt-6">
        <div className="rounded-2xl border border-primary/30 bg-[var(--info-theme-100)]/40 p-6 text-center">
          <h2 className="text-lg font-extrabold tracking-tight text-foreground">
            {dashboardPromoContent.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            {dashboardPromoContent.body}
          </p>
          <Button
            type="button"
            size="lg"
            className="mt-6 w-full font-semibold cabinet:max-w-xs"
            disabled={disabled}
            title={disabledTitle}
            onClick={() => void handleClick()}
          >
            {label}
          </Button>
        </div>
      </section>

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
