import { PillButton } from "@/components/shared/PillButton";
import { heroContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { HeroInterestRateBar } from "./HeroInterestRateBar";
import { cn } from "@/lib/utils";

export interface HeroSectionProps {
  onSeeOptimizer?: () => void;
  onCabinetCta?: () => void;
  ctaLabel?: string;
}

export function HeroSection({
  onSeeOptimizer,
  onCabinetCta,
  ctaLabel,
}: HeroSectionProps) {
  const onCta = onCabinetCta ?? onSeeOptimizer;
  const label = ctaLabel ?? heroContent.cta.label;

  return (
    <section className="relative overflow-hidden bg-[var(--page-bg)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute right-0 top-0 h-[1000px] w-[1000px] max-w-[100vw]"
          style={{
            background:
              "radial-gradient(100% 100% at 100% 0%, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 100%)",
          }}
        />
        <img
          src={landingAsset("landing/hero/hero-lines.png")}
          alt=""
          className={cn(
            "absolute bottom-0 left-1/2 z-0 max-w-none -translate-x-1/2 object-cover object-bottom opacity-90",
            "h-[50%] min-h-[200px] w-[140%]",
            "bp600:min-h-[260px] bp600:w-[120%]",
            "bp840:h-[55%] bp840:min-h-[300px]",
          )}
        />
      </div>

      <div className="relative z-10 px-4 pb-14 pt-10 bp840:pb-20 bp840:pt-16 bp1200:pb-24 bp1200:pt-20">
        <div className="app-page-marketing">
          <div className="mx-auto w-full text-center">
            <h1 className="app-header-h2 text-title">
              <span className="block">{heroContent.headlineLead}</span>
              <span className="mt-1 block">{heroContent.headlineHighlight}</span>
            </h1>

            <p className="app-header-subheadline-regular text-average mt-5 bp840:mt-6">
              {heroContent.sublineBefore}
              <span className="app-header-subheadline-bold text-average">
                {heroContent.sublineBold}
              </span>
              {heroContent.sublineAfter}
            </p>
          </div>

          <div className="mt-8 flex justify-center bp840:mt-10">
            <HeroInterestRateBar className="w-full" />
          </div>

          <div className="mt-8 flex justify-center bp840:mt-10">
            <PillButton type="button" variant="primary" size="xxl" onClick={() => onCta?.()}>
              {label}
            </PillButton>
          </div>

          <div className="relative mx-auto mt-10 max-w-3xl bp840:mt-14">
            <div
              className={cn(
                "relative overflow-hidden rounded-[var(--design-screen-corner-radius,30px)]",
                "border border-[var(--neutral-theme-200)] bg-black/5 shadow-[var(--landing-shadow)]",
              )}
            >
              <video
                className="aspect-video w-full object-cover"
                controls
                playsInline
                preload="metadata"
                poster={landingAsset("landing/hero/little.png")}
                aria-label={heroContent.videoAlt}
              >
                <source
                  src={landingAsset("landing/hero/landing-video-section.mp4")}
                  type="video/mp4"
                />
              </video>
              <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12 text-center text-sm font-semibold text-white bp840:text-base">
                {heroContent.videoCaption}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
