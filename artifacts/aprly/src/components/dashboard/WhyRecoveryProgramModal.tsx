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

const WHY_ICONS = [
  "cabinet/paywall/umbrella.svg",
  "cabinet/paywall/shield.svg",
  "cabinet/paywall/chart.svg",
] as const;

type WhyRecoveryProgramModalProps = {
  open: boolean;
  onClose: () => void;
};

export function WhyRecoveryProgramModal({ open, onClose }: WhyRecoveryProgramModalProps) {
  const copy = activateAccountContent.whyModal;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        className={cn("dash-modal-panel dash-modal-panel--wide", dashDialogRadiusClassName)}
        overlayClassName="dash-modal-overlay"
        closeClassName="dash-modal-close data-[state=open]:bg-transparent data-[state=open]:text-[var(--action-default-color)]"
      >
        <DialogHeader className="space-y-0">
          <DialogTitle className="app-header-h5 text-title pr-8 text-center">
            {copy.title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-5">
          {copy.sections.map((section, index) => {
            const iconSrc = WHY_ICONS[index] ?? WHY_ICONS[1];
            return (
              <div key={section.title} className="flex items-start gap-3">
                <img
                  src={cabinetAsset(iconSrc)}
                  alt=""
                  aria-hidden
                  className="h-11 w-11 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <p className="app-header-h6 text-average">{section.title}</p>
                  <p className="app-text-p1-regular text-average mt-1">{section.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <PillButton
            type="button"
            variant="primary"
            size="default"
            className="h-[52px] w-[89px]"
            onClick={onClose}
          >
            {copy.ok}
          </PillButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
