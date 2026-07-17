import { Loader2 } from "lucide-react";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { PillButton } from "@/components/shared/PillButton";
import { cabinetAsset } from "@/lib/cabinet-assets";

type AccountSuccessViewProps = {
  message: string;
  onOk: () => void;
};

export function AccountSuccessView({ message, onOk }: AccountSuccessViewProps) {
  const copy = dashboardProfileContent;
  return (
    <div className="dash-account-success">
      <img
        src={cabinetAsset("cabinet/account/success-background.png")}
        alt=""
        aria-hidden
        className="mb-4 h-40 w-40 object-contain"
      />
      <p className="dash-account-success-message">{message}</p>
      <PillButton type="button" variant="primary" size="default" className="mt-6" onClick={onOk}>
        {copy.ok}
      </PillButton>
    </div>
  );
}

type AccountSubmitButtonProps = {
  label: string;
  pending?: boolean;
};

export function AccountSubmitButton({ label, pending }: AccountSubmitButtonProps) {
  return (
    <div className="flex justify-center pt-2">
      <PillButton type="submit" variant="primary" size="default" disabled={pending}>
        {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : label}
      </PillButton>
    </div>
  );
}
