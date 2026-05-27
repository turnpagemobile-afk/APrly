import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type AuditPaywallModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPay: () => void;
  isLoading?: boolean;
};

export function AuditPaywallModal({
  open,
  onOpenChange,
  onPay,
  isLoading = false,
}: AuditPaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unlock Verified Audit Packet</DialogTitle>
          <DialogDescription>
            A one-time payment of US $39 unlocks unlimited partner submissions for your
            plan leads. You can still create and edit leads before paying.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button type="button" onClick={onPay} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Stripe…
              </>
            ) : (
              "Pay $39 — unlock sending"
            )}
          </Button>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
