import { PillButton } from "@/components/shared/PillButton";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { dashDialogRadiusClassName } from "@/lib/dashboard-dialog-styles";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PlanSendSuccessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PlanSendSuccessModal({ open, onOpenChange }: PlanSendSuccessModalProps) {
  const copy = planLeadDetailContent.sendSuccessModal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("dash-modal-panel", dashDialogRadiusClassName)}
        overlayClassName="dash-modal-overlay"
        closeClassName="dash-modal-close data-[state=open]:bg-transparent data-[state=open]:text-[var(--action-default-color)]"
      >
        <div className="flex flex-col items-center text-center">
          <img
            src={cabinetAsset("cabinet/dashboard/success_back.png")}
            alt=""
            aria-hidden
            className="h-40 w-40 object-contain"
          />
          <DialogHeader className="mt-4 space-y-0">
            <DialogTitle className="app-header-h6 text-title">{copy.title}</DialogTitle>
          </DialogHeader>
          <p className="app-text-p1-regular text-average mt-3 max-w-sm">{copy.body}</p>
          <PillButton
            type="button"
            variant="primary"
            size="default"
            className="mt-6 h-[52px] w-[89px]"
            onClick={() => onOpenChange(false)}
          >
            {copy.ok}
          </PillButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
