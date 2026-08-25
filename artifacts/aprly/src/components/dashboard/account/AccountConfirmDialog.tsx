import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PillButton } from "@/components/shared/PillButton";
import { dashDialogRadiusClassName } from "@/lib/dashboard-dialog-styles";
import { cn } from "@/lib/utils";

export type AccountConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
};

export function AccountConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  cancelLabel,
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
        className={cn("dash-account-confirm-dialog sm:max-w-[420px]", dashDialogRadiusClassName)}
        overlayClassName="dash-account-confirm-overlay"
        closeClassName="dash-account-confirm-close data-[state=open]:bg-transparent data-[state=open]:text-[var(--action-default-color)]"
      >
        <DialogHeader className="space-y-0 text-left">
          <DialogTitle className="app-header-h6 text-average pr-8">{title}</DialogTitle>
        </DialogHeader>
        <div className="dash-account-confirm-body">
          <p className="app-text-p1-regular text-average">{message}</p>
          <div className="dash-account-confirm-actions">
            <PillButton
              type="button"
              variant="destructive"
              size="default"
              className="w-full"
              disabled={isPending}
              onClick={() => void onConfirmClick()}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                confirmLabel
              )}
            </PillButton>
            {cancelLabel ? (
              <PillButton
                type="button"
                variant="secondary"
                size="default"
                className="w-full"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                {cancelLabel}
              </PillButton>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
