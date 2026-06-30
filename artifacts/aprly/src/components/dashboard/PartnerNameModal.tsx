import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getGetMeQueryKey, usePatchMe } from "@workspace/api-client-react";
import { AuthTextInput } from "@/components/shared/auth-form/AuthTextInput";
import { PillButton } from "@/components/shared/PillButton";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { useAuth } from "@/lib/auth-session";
import { toast } from "@/hooks/use-toast";
import { dashDialogRadiusClassName } from "@/lib/dashboard-dialog-styles";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PartnerNameModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
};

export function PartnerNameModal({ open, onOpenChange, onComplete }: PartnerNameModalProps) {
  const copy = planLeadDetailContent.partnerNameModal;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const patchMe = usePatchMe();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmitAttempted(false);
      return;
    }
    setFirstName(user?.firstName?.trim() ?? "");
    setLastName(user?.lastName?.trim() ?? "");
  }, [open, user?.firstName, user?.lastName]);

  const firstNameError = submitAttempted && !firstName.trim();
  const lastNameError = submitAttempted && !lastName.trim();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!firstName.trim() || !lastName.trim()) return;

    try {
      await patchMe.mutateAsync({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      onOpenChange(false);
      onComplete();
    } catch {
      toast({
        title: planLeadDetailContent.sendErrorTitle,
        description: planLeadDetailContent.sendErrorDescription,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "dash-modal-panel dash-modal-panel--name sm:max-w-[420px]",
          dashDialogRadiusClassName,
        )}
        overlayClassName="dash-account-confirm-overlay"
        closeClassName="dash-modal-close data-[state=open]:bg-transparent data-[state=open]:text-[var(--action-default-color)]"
      >
        <DialogHeader className="space-y-0 text-left">
          <DialogTitle className="dash-modal-title">{copy.title}</DialogTitle>
        </DialogHeader>

        <p className="dash-modal-subtitle">{copy.subtitle}</p>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-4">
          <AuthTextInput
            id="partner-first-name"
            label={copy.firstName}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            maxLength={120}
            error={firstNameError ? copy.fieldRequired : null}
          />

          <AuthTextInput
            id="partner-last-name"
            label={copy.lastName}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            maxLength={120}
            error={lastNameError ? copy.fieldRequired : null}
          />

          <PillButton
            type="submit"
            size="lg"
            className="mt-6 w-full"
            disabled={patchMe.isPending}
          >
            {patchMe.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                {copy.saving}
              </>
            ) : (
              copy.continue
            )}
          </PillButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
