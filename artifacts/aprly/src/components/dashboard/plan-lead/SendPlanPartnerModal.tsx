import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Partner } from "@workspace/api-client-react";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { dashDialogRadiusClassName } from "@/lib/dashboard-dialog-styles";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SendPlanPartnerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partners: Partner[];
  isSending: boolean;
  onSend: (partnerId: number) => void;
};

export function SendPlanPartnerModal({
  open,
  onOpenChange,
  partners,
  isSending,
  onSend,
}: SendPlanPartnerModalProps) {
  const copy = planLeadDetailContent.partnerModal;
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      return;
    }
    if (partners.length === 1) {
      setSelectedId(partners[0]!.id);
    }
  }, [open, partners]);

  const onSendClick = () => {
    if (selectedId == null || isSending) return;
    onSend(selectedId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("dash-modal-panel dash-modal-panel--wide", dashDialogRadiusClassName)}
        overlayClassName="dash-modal-overlay"
        closeClassName="dash-modal-close data-[state=open]:bg-transparent data-[state=open]:text-[var(--action-default-color)]"
      >
        <DialogHeader className="space-y-0 text-left">
          <DialogTitle className="dash-modal-title">{copy.title}</DialogTitle>
        </DialogHeader>

        <p className="dash-modal-subtitle">{copy.subtitle}</p>

        {partners.length === 0 ? (
          <p className="dash-modal-subtitle text-[var(--hint-text-color)]">{copy.empty}</p>
        ) : (
          <ul className="dash-modal-partner-list" role="radiogroup" aria-label={copy.subtitle}>
            {partners.map((partner) => {
              const selected = selectedId === partner.id;
              return (
                <li key={partner.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "dash-modal-partner-option",
                      selected && "dash-modal-partner-option--selected",
                    )}
                    onClick={() => setSelectedId(partner.id)}
                  >
                    <span className="dash-modal-partner-radio" aria-hidden>
                      <span className="dash-modal-partner-radio-dot" />
                    </span>
                    <span className="dash-modal-partner-name">{partner.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          className="dash-modal-primary-btn"
          disabled={selectedId == null || isSending || partners.length === 0}
          onClick={onSendClick}
        >
          {isSending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              {planLeadDetailContent.sending}
            </>
          ) : (
            copy.sendInfo
          )}
        </button>
      </DialogContent>
    </Dialog>
  );
}
