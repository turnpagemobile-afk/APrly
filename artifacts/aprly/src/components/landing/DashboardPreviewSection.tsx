import { dashboardPreviewContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";

/** Column ≤839: darker at bottom (Figma) */
const PANEL_GRADIENT_COLUMN =
  "bg-[linear-gradient(to_top,var(--primary-theme-200)_0%,var(--primary-theme-100)_45%,var(--primary-theme-050)_100%)]";

/** Row ≥840: darker on the left (Figma) */
const PANEL_GRADIENT_ROW =
  "bg-[linear-gradient(to_right,var(--primary-theme-200)_0%,var(--primary-theme-100)_50%,var(--primary-theme-050)_100%)]";

const panelBase = cn(
  "overflow-hidden rounded-[24px] bp1200:rounded-[28px] bp1600:rounded-[32px]",
);

const copyClass = cn(
  "font-extrabold uppercase leading-[1.22] tracking-tight text-[var(--primary-theme-900)]",
  "text-[0.8125rem] bp600:text-[0.9375rem] bp1200:text-[1.0625rem] bp1600:text-[1.25rem]",
);

function DashboardCopy() {
  return (
    <div>
      <p className={copyClass}>
        {dashboardPreviewContent.titleLead}{" "}
        <span className="text-[var(--primary-theme-500)]">
          {dashboardPreviewContent.titleHighlight}
        </span>{" "}
        {dashboardPreviewContent.titleRest}
      </p>
      <p className={cn(copyClass, "mt-4 bp840:mt-5")}>
        {dashboardPreviewContent.subtitleLead}{" "}
        <span className="whitespace-nowrap text-[var(--primary-theme-500)]">
          {dashboardPreviewContent.subtitleHighlight}
        </span>{" "}
        {dashboardPreviewContent.subtitleRest}
      </p>
    </div>
  );
}

function DashboardMockup({ className }: { className?: string }) {
  return (
    <img
      src={landingAsset("landing/dashboard/macbook-air-2022.png")}
      alt={dashboardPreviewContent.imageAlt}
      width={493}
      height={450}
      className={className}
      loading="lazy"
    />
  );
}

export function DashboardPreviewSection() {
  return (
    <section className="relative bg-[var(--page-bg)] px-4 py-10 bp600:py-12 bp1200:py-16 bp1600:py-20">
      <div className="app-page-marketing relative">
        {/* ≤839: column — single blue card */}
        <div className={cn(panelBase, PANEL_GRADIENT_COLUMN, "bp840:hidden")}>
          <div className="flex justify-center px-4 pt-6 bp600:pt-8">
            <DashboardMockup
              className={cn(
                "object-contain",
                "h-[450px] w-[493px] max-w-full",
                "bp600:h-auto bp600:w-full bp600:max-w-[min(100%,493px)]",
              )}
            />
          </div>
          <div className="px-6 pb-8 pt-4 text-left bp600:px-8">
            <DashboardCopy />
          </div>
        </div>

        {/* ≥840: row — text panel left, mockup on page bg right */}
        <div
          className={cn(
            "hidden bp840:grid",
            "bp840:grid-cols-[minmax(0,44%)_minmax(0,1fr)]",
            "bp840:items-center bp840:gap-8 bp1200:gap-10 bp1600:gap-12",
          )}
        >
          <div
            className={cn(
              panelBase,
              PANEL_GRADIENT_ROW,
              "px-8 py-10 text-left bp1200:px-10 bp1200:py-12 bp1600:px-12",
            )}
          >
            <DashboardCopy />
          </div>

          <div
            className={cn(
              "flex min-h-[280px] items-center justify-end",
              "bp1200:min-h-[320px] bp1600:min-h-[360px]",
            )}
          >
            <DashboardMockup
              className={cn(
                "h-auto w-full max-w-[min(100%,560px)] object-contain object-right-bottom",
                "bp1200:max-w-[640px] bp1600:max-w-[720px]",
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
