import { Button } from "@/components/ui/button";
import { heroContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { HeroInterestRateBar } from "./HeroInterestRateBar";
import { cn } from "@/lib/utils";

export interface HeroSectionProps {
  onSeeOptimizer?: () => void;
  onCabinetCta?: () => void;
  ctaLabel?: string;
}

const headlineBase =
  "font-hero-display text-[clamp(2rem,3.5vw+0.5rem,4rem)] uppercase leading-[1.1]";

const headlineRegular = "font-semibold not-italic text-[var(--secondary-theme-300)]";
const headlineAccent = "font-bold italic text-[var(--neutral-theme-000)]";

export function HeroSection({
  onSeeOptimizer,
  onCabinetCta,
  ctaLabel,
}: HeroSectionProps) {
  const onCta = onCabinetCta ?? onSeeOptimizer;
  const label = ctaLabel ?? heroContent.cta.label;

  return (
    <section className="relative overflow-hidden bg-[var(--primary-theme-800)] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(72,190,56,0.12)_0%,transparent_55%),radial-gradient(ellipse_at_80%_60%,rgba(72,190,56,0.08)_0%,transparent_50%)]" />
        <img
          src={landingAsset("landing/hero/landing-wave.png")}
          alt=""
          className={cn(
            "absolute bottom-0 left-1/2 z-0 max-w-none -translate-x-1/2 object-cover object-bottom",
            "h-[45%] min-h-[180px] w-[140%]",
            "bp600:min-h-[240px] bp600:w-[120%]",
            "bp840:h-[50%] bp840:min-h-[280px]",
          )}
        />
      </div>

      <div className="relative z-10 px-4 pb-14 pt-10 bp840:pb-20 bp840:pt-16 bp1200:pb-24 bp1200:pt-20">
        <div className="app-page-marketing">
          <div className="w-full text-left">
            <h1 className={cn(headlineBase, "hidden bp1200:block")}>
              <span className={cn("block", headlineRegular)}>
                YOUR <span className={headlineAccent}>DEBT</span> ISN&apos;T A CHARACTER FLAW.
              </span>
              <span className={cn("mt-2 block", headlineRegular)}>
                IT&apos;S A <span className={headlineAccent}>MATH PROBLEM.</span>
              </span>
            </h1>

            <h1 className={cn(headlineBase, "hidden bp840:block bp1200:hidden")}>
              <span className={cn("block", headlineRegular)}>
                YOUR <span className={headlineAccent}>DEBT</span> ISN&apos;T A CHARACTER
              </span>
              <span className={cn("block", headlineRegular)}>FLAW.</span>
              <span className={cn("mt-2 block", headlineRegular)}>
                IT&apos;S A <span className={headlineAccent}>MATH PROBLEM.</span>
              </span>
            </h1>

            <h1
              className={cn(
                headlineBase,
                headlineRegular,
                "bp840:hidden",
              )}
            >
              YOUR <span className={headlineAccent}>DEBT</span> ISN&apos;T A CHARACTER FLAW.
              IT&apos;S A <span className={headlineAccent}>MATH PROBLEM.</span>
            </h1>

            <p className="mt-5 font-hero-body text-base font-medium leading-[22px] text-[var(--neutral-theme-000)] bp600:text-xl bp600:leading-[26px] bp840:mt-6">
              {heroContent.subline}
            </p>
          </div>

          <div className="mt-8 flex justify-center bp840:mt-10">
            <HeroInterestRateBar className="w-full" />
          </div>

          <div className="relative mx-auto mt-10 max-w-3xl bp840:mt-14">
            <div
              className={cn(
                "relative overflow-hidden rounded-[var(--design-screen-corner-radius,30px)]",
                "border border-white/15 bg-black/20 shadow-2xl",
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

            <div className="mt-8 flex justify-center bp840:mt-10">
              <Button
                size="lg"
                onClick={() => onCta?.()}
                className={cn(
                  "h-12 min-w-[220px] rounded-full px-10 text-sm font-bold uppercase tracking-wide",
                  "bg-white text-[var(--primary-theme-700)] hover:bg-white/90",
                )}
              >
                {label}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
