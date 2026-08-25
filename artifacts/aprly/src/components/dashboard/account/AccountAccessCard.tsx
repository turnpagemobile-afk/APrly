import { Loader2 } from "lucide-react";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { PillButton } from "@/components/shared/PillButton";

type AccountAccessCardProps = {
  subscriptionActive: boolean;
  accessActivatedAt?: string | null;
  onActivate: () => void;
  isCheckoutLoading?: boolean;
};

function formatAccessActivatedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildActiveDescription(
  accessActivatedAt: string | null | undefined,
  copy: typeof dashboardProfileContent.accessCard,
): string {
  if (accessActivatedAt) {
    return copy.activeDescriptionFrom.replace("{date}", formatAccessActivatedDate(accessActivatedAt));
  }
  return copy.activeDescriptionFallback;
}

export function AccountAccessCard({
  subscriptionActive,
  accessActivatedAt,
  onActivate,
  isCheckoutLoading = false,
}: AccountAccessCardProps) {
  const copy = dashboardProfileContent.accessCard;

  if (subscriptionActive) {
    return (
      <section className="dash-account-card">
        <div className="dash-account-access-row">
          <div className="dash-account-access-copy dash-account-access-copy--active">
            <img
              src={cabinetAsset("cabinet/account/box-icon.svg")}
              alt=""
              aria-hidden
              className="h-11 w-11 shrink-0"
            />
            <div className="min-w-0">
              <p className="app-header-screen-title-bold text-average">{copy.activeTitle}</p>
              <p className="app-text-p1-regular text-average mt-1">
                {buildActiveDescription(accessActivatedAt, copy)}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dash-account-card">
      <div className="dash-account-access-row">
        <div className="dash-account-access-copy dash-account-access-copy--get-full-access">
          <img
            src={cabinetAsset("cabinet/dashboard/card-label-icon.svg")}
            alt=""
            aria-hidden
            className="h-11 w-11 shrink-0"
          />
          <p className="app-header-screen-title-bold text-average">{copy.getFullAccess}</p>
        </div>
        <PillButton
          type="button"
          variant="primary"
          size="default"
          className="h-[52px] w-[201px] max-w-full"
          onClick={onActivate}
          disabled={isCheckoutLoading}
        >
          {isCheckoutLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            copy.activate
          )}
        </PillButton>
      </div>
    </section>
  );
}
