import { dashboardPromoContent } from "@/content/dashboard-home";
import { applyCabinetSwUpdate } from "@/lib/pwa/cabinet-sw-update";
import { PillButton } from "@/components/shared/PillButton";

type CabinetUpdateBannerProps = {
  visible: boolean;
};

export function CabinetUpdateBanner({ visible }: CabinetUpdateBannerProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      className="bg-[var(--primary-theme-600)] px-4 py-3 text-center"
    >
      <div className="app-page-cabinet flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <span className="app-text-p1-regular text-neutral-000">
          {dashboardPromoContent.updateAvailable}
        </span>
        <PillButton
          type="button"
          variant="special"
          size="sm"
          className="shrink-0"
          onClick={() => void applyCabinetSwUpdate()}
        >
          {dashboardPromoContent.updateRefresh}
        </PillButton>
      </div>
    </div>
  );
}
