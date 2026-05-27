import { RefreshCw } from "lucide-react";
import { dashboardPromoContent } from "@/content/dashboard-home";
import { applyCabinetSwUpdate } from "@/lib/pwa/cabinet-sw-update";
import { Button } from "@/components/ui/button";

type CabinetUpdateBannerProps = {
  visible: boolean;
};

export function CabinetUpdateBanner({ visible }: CabinetUpdateBannerProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      className="border-b border-primary/40 bg-primary/10 px-4 py-3 text-center text-sm text-foreground"
    >
      <div className="app-page-cabinet flex flex-col items-center justify-center gap-2 font-medium sm:flex-row sm:gap-3">
        <span>{dashboardPromoContent.updateAvailable}</span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 shrink-0 font-semibold"
          onClick={() => void applyCabinetSwUpdate()}
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          {dashboardPromoContent.updateRefresh}
        </Button>
      </div>
    </div>
  );
}
