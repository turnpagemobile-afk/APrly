import { WifiOff } from "lucide-react";
import { dashboardPromoContent } from "@/content/dashboard-home";

type CabinetOfflineBannerProps = {
  visible: boolean;
};

export function CabinetOfflineBanner({ visible }: CabinetOfflineBannerProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-foreground"
    >
      <div className="app-page-cabinet flex items-center justify-center gap-2 font-medium">
        <WifiOff className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <span>{dashboardPromoContent.offlineBanner}</span>
      </div>
    </div>
  );
}
