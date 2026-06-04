import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type AccountConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
};

export function AccountConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  onConfirm,
  isPending = false,
}: AccountConfirmDialogProps) {
  const onConfirmClick = async () => {
    if (isPending) return;
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="dash-account-confirm-dialog sm:max-w-[420px]"
        overlayClassName="dash-account-confirm-overlay"
        closeClassName="dash-account-confirm-close data-[state=open]:bg-transparent data-[state=open]:text-[var(--action-default-color)]"
      >
        <DialogHeader className="space-y-0 text-left">
          <DialogTitle className="dash-account-confirm-title">{title}</DialogTitle>
        </DialogHeader>
        <div className="dash-account-confirm-body">
          <p className="dash-account-confirm-message">{message}</p>
          <button
            type="button"
            className="dash-account-confirm-btn"
            disabled={isPending}
            onClick={() => void onConfirmClick()}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
