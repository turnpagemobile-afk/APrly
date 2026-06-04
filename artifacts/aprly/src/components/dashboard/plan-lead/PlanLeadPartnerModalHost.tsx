import type { Partner } from "@workspace/api-client-react";
import { SendPlanPartnerModal } from "@/components/dashboard/plan-lead/SendPlanPartnerModal";
import { useCabinetActivate } from "@/lib/cabinet-activate-context";

type PlanLeadPartnerModalHostProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partners: Partner[];
  isSending: boolean;
  checkoutReturnPath: string;
  subscriptionActive: boolean;
  onSendActive: (partnerId: number) => void;
};

export function PlanLeadPartnerModalHost({
  open,
  onOpenChange,
  partners,
  isSending,
  checkoutReturnPath,
  subscriptionActive,
  onSendActive,
}: PlanLeadPartnerModalHostProps) {
  const { openActivateModal } = useCabinetActivate();

  const onSend = (partnerId: number) => {
    if (!subscriptionActive) {
      onOpenChange(false);
      openActivateModal(checkoutReturnPath);
      return;
    }
    onSendActive(partnerId);
  };

  return (
    <SendPlanPartnerModal
      open={open}
      onOpenChange={onOpenChange}
      partners={partners}
      isSending={isSending}
      onSend={onSend}
    />
  );
}
