import { Loader2 } from "lucide-react";
import { activateAccountContent } from "@/content/activate-account";
import { landingAsset } from "@/lib/landing-assets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ActivateAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWhyClick: () => void;
  onActivate: () => void;
  isLoading?: boolean;
};

export function ActivateAccountModal({
  open,
  onOpenChange,
  onWhyClick,
  onActivate,
  isLoading = false,
}: ActivateAccountModalProps) {
  const copy = activateAccountContent.modal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="dash-modal-panel"
        overlayClassName="dash-modal-overlay"
        closeClassName="dash-modal-close data-[state=open]:bg-transparent data-[state=open]:text-[var(--action-default-color)]"
      >
        <DialogHeader className="space-y-0 text-left">
          <DialogTitle className="dash-modal-title">{copy.title}</DialogTitle>
        </DialogHeader>

        <div className="dash-modal-price-banner">
          <p className="dash-modal-price-lead">{copy.priceBannerLead}</p>
          <p className="dash-modal-price-value">{copy.price}</p>
        </div>

        <ul className="dash-modal-feature-list">
          {copy.features.map((feature) => (
            <li key={feature} className="dash-modal-feature-item">
              <img
                src={landingAsset("landing/subscribe/checkmark.svg")}
                alt=""
                aria-hidden
                className="dash-modal-feature-check"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <p className="dash-modal-program-note">
          {copy.programNote}{" "}
          <button type="button" className="dash-modal-why-link" onClick={onWhyClick}>
            {copy.whyLink}
          </button>
        </p>

        <button
          type="button"
          className="dash-modal-primary-btn"
          disabled={isLoading}
          onClick={onActivate}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              {copy.redirecting}
            </>
          ) : (
            copy.activate
          )}
        </button>
      </DialogContent>
    </Dialog>
  );
}
