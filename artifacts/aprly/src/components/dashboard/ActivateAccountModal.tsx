import { Loader2 } from "lucide-react";
import { activateAccountContent } from "@/content/activate-account";
import { PillButton } from "@/components/shared/PillButton";
import { dashDialogRadiusClassName } from "@/lib/dashboard-dialog-styles";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ActivateAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWhyClick: () => void;
  onActivate: () => void;
  isLoading?: boolean;
};

export function ActivateAccountModal({
  open,
  onOpenChange,
  onWhyClick,
  onActivate,
  isLoading = false,
}: ActivateAccountModalProps) {
  const copy = activateAccountContent.modal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("dash-modal-panel", dashDialogRadiusClassName)}
        overlayClassName="dash-modal-overlay"
        closeClassName="dash-modal-close data-[state=open]:bg-transparent data-[state=open]:text-[var(--action-default-color)]"
      >
        <DialogHeader className="space-y-0 text-left">
          <DialogTitle className="app-header-h6 text-average pr-8">{copy.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-5 rounded-[12px] bg-[var(--primary-theme-100)] px-5 py-5 text-center">
          <p className="app-header-screen-title-bold text-title">{copy.priceBannerLead}</p>
          <p className="app-header-screen-title-bold text-action mt-1">{copy.price}</p>
        </div>

        <ul className="mt-5 space-y-3">
          {copy.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <img
                src={cabinetAsset("cabinet/paywall/check.svg")}
                alt=""
                aria-hidden
                className="mt-0.5 h-6 w-6 shrink-0"
              />
              <span className="app-text-p1-regular text-average">{feature}</span>
            </li>
          ))}
        </ul>

        <p className="app-text-p1-regular text-average mt-5 text-center">
          {copy.programNote}{" "}
          <button
            type="button"
            className="app-text-p1-bold text-action underline-offset-2 hover:underline"
            onClick={onWhyClick}
          >
            {copy.whyLink}
          </button>
        </p>

        <div className="mt-6 flex justify-center">
          <PillButton
            type="button"
            variant="primary"
            size="default"
            className="h-[52px] w-[201px] max-w-full"
            disabled={isLoading}
            onClick={onActivate}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                {copy.redirecting}
              </>
            ) : (
              copy.activate
            )}
          </PillButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
