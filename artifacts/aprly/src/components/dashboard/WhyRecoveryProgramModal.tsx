import { ShieldCheck, Umbrella, Wallet } from "lucide-react";
import { activateAccountContent } from "@/content/activate-account";
import { dashDialogRadiusClassName } from "@/lib/dashboard-dialog-styles";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WHY_ICONS = [Umbrella, ShieldCheck, Wallet] as const;

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
          <DialogTitle className="dash-modal-title dash-modal-title--center">{copy.title}</DialogTitle>
        </DialogHeader>

        <div className="dash-modal-why-sections">
          {copy.sections.map((section, index) => {
            const Icon = WHY_ICONS[index] ?? ShieldCheck;
            return (
              <div key={section.title} className="dash-modal-why-row">
                <span className="dash-modal-why-icon" aria-hidden>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="dash-modal-why-heading">{section.title}</p>
                  <p className="dash-modal-why-body">{section.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" className="dash-modal-primary-btn" onClick={onClose}>
          {copy.ok}
        </button>
      </DialogContent>
    </Dialog>
  );
}
