import { CheckCircle2, Loader2 } from "lucide-react";
import { dashboardProfileContent } from "@/content/dashboard-profile";

type AccountSuccessViewProps = {
  message: string;
  onOk: () => void;
};

export function AccountSuccessView({ message, onOk }: AccountSuccessViewProps) {
  const copy = dashboardProfileContent;
  return (
    <div className="dash-account-success">
      <div className="dash-account-success-icon" aria-hidden>
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <p className="dash-account-success-message">{message}</p>
      <button type="button" className="dash-account-primary-btn mt-6" onClick={onOk}>
        {copy.ok}
      </button>
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
      <button type="submit" className="dash-account-primary-btn" disabled={pending}>
        {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : label}
      </button>
    </div>
  );
}
