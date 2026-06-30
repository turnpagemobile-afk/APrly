import { dashboardPreviewContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";

const MOCKUP_W = 587;
const MOCKUP_H = 456;
const DESKTOP_CARD_UNDERLAP = 300;
const MOBILE_PANEL_OVERLAP = 180;
const MOBILE_TEXT_GAP_BELOW_MOCKUP = 20;
const MOCKUP_TOP_GAP_FROM_PREV = 80;

const PANEL_BG = "bg-[var(--secondary-theme-200)]";

const panelBase = cn(
  "overflow-hidden rounded-[24px] bp1200:rounded-[28px] bp1600:rounded-[32px]",
);

/** Padding from peach panel edge to text (Figma). Applied on the panel only. */
const panelPadMobile = "px-10 pb-[50px]";
const panelPadDesktop = "pl-[50px] pt-10 pb-10";

const mockupClass = cn(
  "h-[456px] w-[587px] max-w-[calc(100vw-2rem)] shrink-0 object-contain",
  "max-[586px]:h-auto max-[586px]:aspect-[587/456]",
);

const screenTitle = "app-header-screen-title text-average";
const screenTitleBold = "app-header-screen-title-bold text-action";

function DashboardCopy() {
  return (
    <div className="w-full bp840:max-w-[32rem]">
      <p className={screenTitle}>
        <span>{dashboardPreviewContent.titleLead}</span>{" "}
        <span className={screenTitleBold}>
          {dashboardPreviewContent.titleHighlight}
        </span>{" "}
        <span>{dashboardPreviewContent.titleRest}</span>
      </p>
      <p className={screenTitle}>
        <span>{dashboardPreviewContent.subtitleLead}</span>{" "}
        <span className={screenTitleBold}>
          {dashboardPreviewContent.subtitleHighlight}
        </span>{" "}
        <span>{dashboardPreviewContent.subtitleRest}</span>
      </p>
    </div>
  );
}

function DashboardMockup({ className }: { className?: string }) {
  return (
    <img
      src={landingAsset("landing/dashboard/macbook-air-2022.png")}
      alt={dashboardPreviewContent.imageAlt}
      width={MOCKUP_W}
      height={MOCKUP_H}
      className={cn(mockupClass, className)}
      loading="lazy"
    />
  );
}

export function DashboardPreviewSection() {
  const desktopCardRight = MOCKUP_W - DESKTOP_CARD_UNDERLAP;

  return (
    <section
      className="relative overflow-x-clip border-y border-[var(--primary-theme-800)] bg-[var(--page-bg)] px-4 pb-10 bp600:pb-12 bp1200:pb-16 bp1600:pb-20"
      style={{ paddingTop: MOCKUP_TOP_GAP_FROM_PREV }}
    >
      <div className="app-page-marketing relative">
        {/* ≤839: mockup on page bg, peach panel overlaps from below */}
        <div className="relative bp840:hidden">
          <div className="relative z-10 flex justify-center">
            <DashboardMockup />
          </div>
          <div
            className={cn(
              panelBase,
              PANEL_BG,
              "relative z-0 text-left",
              panelPadMobile,
            )}
            style={{
              marginTop: -MOBILE_PANEL_OVERLAP,
              paddingTop:
                MOBILE_PANEL_OVERLAP + MOBILE_TEXT_GAP_BELOW_MOCKUP,
            }}
          >
            <DashboardCopy />
          </div>
        </div>

        {/* ≥840: peach panel extends under fixed-size mockup */}
        <div className="relative hidden min-h-[456px] bp840:flex bp840:items-center">
          <div
            className={cn(
              panelBase,
              PANEL_BG,
              "relative z-0 min-w-0 flex-1 text-left",
              panelPadDesktop,
            )}
            style={{ marginRight: desktopCardRight }}
          >
            <DashboardCopy />
          </div>

          <DashboardMockup className="absolute right-0 top-1/2 z-10 -translate-y-1/2" />
        </div>
      </div>
    </section>
  );
}
