import { useState } from "react";
import { User } from "lucide-react";
import { useLocation } from "wouter";
import { accountMenuContent } from "@/content/dashboard-profile";
import { dashboardPromoContent } from "@/content/dashboard-home";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutConfirmDialog } from "@/components/dashboard/LogoutConfirmDialog";
import { dashDialogRadiusClassName } from "@/lib/dashboard-dialog-styles";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/use-media-query";
import { useCabinetPwaContext } from "@/lib/pwa/cabinet-pwa-context";

const menuItemClass = cn(
  "cursor-pointer justify-center rounded-[12px] py-3 text-center",
  "app-button-button-s text-action uppercase",
  "focus:bg-[var(--primary-theme-100)] focus:text-action",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
);

function AccountMenuTrigger(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-9 w-9 shrink-0 rounded-full border-[var(--action-default-color)] bg-white text-[var(--action-default-color)] hover:bg-white/90"
      aria-label="Account menu"
      {...props}
    >
      <User className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}

type DashboardUserMenuProps = {
  subscriptionActive: boolean;
};

export function DashboardUserMenu({ subscriptionActive }: DashboardUserMenuProps) {
  const [, setLocation] = useLocation();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [iosDialogOpen, setIosDialogOpen] = useState(false);
  const isMobileViewport = useMediaQuery("(max-width: 599px)");
  const {
    isStandalone,
    isOffline,
    canInstall,
    showIosInstallHint,
    promptInstall,
  } = useCabinetPwaContext();

  const installReady = canInstall || showIosInstallHint;
  const showDownloadItem = isMobileViewport && !isStandalone && installReady;
  const downloadDisabled = !subscriptionActive || isOffline;

  const downloadDisabledTitle = !subscriptionActive
    ? dashboardPromoContent.disabledNoSubscription
    : isOffline
      ? dashboardPromoContent.disabledOffline
      : undefined;

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
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <AccountMenuTrigger />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className={cn(
            "min-w-[12rem] rounded-[var(--design-card-corner-radius-small,24px)]",
            "border border-[var(--neutral-theme-200)] bg-white p-2 shadow-lg",
          )}
        >
          {showDownloadItem ? (
            <DropdownMenuItem
              className={menuItemClass}
              disabled={downloadDisabled}
              title={downloadDisabledTitle}
              onSelect={(e) => {
                e.preventDefault();
                void onDownload();
              }}
            >
              {dashboardPromoContent.cta.label}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            className={menuItemClass}
            onSelect={() => setLocation("/dashboard/profile")}
          >
            {accountMenuContent.profile}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={menuItemClass}
            onSelect={() => setLocation("/dashboard?tab=dashboard")}
          >
            {accountMenuContent.subscription}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={menuItemClass}
            onSelect={(e) => {
              e.preventDefault();
              setLogoutOpen(true);
            }}
          >
            {accountMenuContent.logOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      <LogoutConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  );
}
