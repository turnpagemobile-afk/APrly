import { adminContent } from "@/content/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type AdminPartnerConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AdminPartnerConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending,
  onConfirm,
  onCancel,
}: AdminPartnerConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="admin-partner-confirm-dialog" closeClassName="hidden">
        <div className="admin-partner-confirm-dialog-header">
          <DialogTitle className="app-header-h6 text-average uppercase">{title}</DialogTitle>
        </div>
        <div className="admin-partner-confirm-dialog-body">
          <DialogDescription className="app-text-p1-regular text-average">
            {description}
          </DialogDescription>
        </div>
        <div className="admin-partner-confirm-dialog-footer">
          <button type="button" className="admin-confirm-btn--cancel app-button-button-l-m" onClick={onCancel}>
            {adminContent.partners.cancel}
          </button>
          <button
            type="button"
            className="admin-confirm-btn--danger app-button-button-l-m"
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
