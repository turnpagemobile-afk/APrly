import { Button } from "@/components/ui/button";
import { brandContent, footerContent, planContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";
import { LandingFooterBottomBar } from "./LandingFooterBottomBar";

type FooterCtaSectionProps = {
  onAuditClick?: () => void;
  ctaLabel?: string;
  title?: string;
};

export function FooterCtaSection({
  onAuditClick,
  ctaLabel,
  title,
}: FooterCtaSectionProps) {
  const copyright = footerContent.copyrightTemplate.replace(
    "{year}",
    String(new Date().getFullYear()),
  );

  return (
    <section
      id="plan"
      className={cn(
        "scroll-mt-24 relative flex flex-col overflow-hidden text-white",
        "min-h-[520px] bp600:min-h-[560px]",
        "bp840:min-h-[600px]",
        "bp1200:min-h-[640px]",
        "bp1600:min-h-[680px]",
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${landingAsset("landing/footer-cta/bg-image.png")})`,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[var(--palette-secondary-secondary-600)]/90"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[inherit] flex-1 flex-col bp840:justify-between">
        <div
          className={cn(
            "app-page-marketing app-page-marketing-content",
            "pt-14 bp600:pt-16 bp840:pt-20 bp1200:pt-24",
          )}
        >
          <div
            className={cn(
              "flex flex-col items-start text-left",
              "bp600:items-center bp600:text-center",
              "bp840:items-start bp840:text-left",
            )}
          >
            <img
              src={landingAsset("landing/footer/logo.png")}
              alt={brandContent.name}
              className="h-9 w-auto object-contain object-left mix-blend-lighten bp840:h-11 bp1200:h-12"
              loading="lazy"
            />
            <p
              className={cn(
                "app-header-screen-title mt-5 max-w-[18rem] text-white",
                "bp600:mt-6 bp600:max-w-[22rem]",
                "bp840:mt-8 bp840:max-w-[28rem]",
                "bp1200:max-w-[32rem]",
              )}
            >
              {title ?? planContent.title}
            </p>
            <Button
              type="button"
              size="lg"
              className={cn(
                "mt-6 h-12 w-fit min-w-[200px] rounded-full",
                "bg-[var(--primary-theme-500)] px-10 text-sm font-bold uppercase tracking-wide text-white",
                "hover:bg-[var(--primary-theme-600)]",
                "bp840:mt-8 bp840:min-w-[240px]",
              )}
              onClick={() => onAuditClick?.()}
            >
              {ctaLabel ?? planContent.cta.label}
            </Button>
          </div>
        </div>

        <LandingFooterBottomBar
          copyright={copyright}
          className="mt-12 px-5 pb-5 bp840:mt-0"
        />
      </div>
    </section>
  );
}
