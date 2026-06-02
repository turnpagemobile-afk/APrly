import { Button } from "@/components/ui/button";
import { heroContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";

export interface HeroSectionProps {
  onSeeOptimizer: () => void;
}

export function HeroSection({ onSeeOptimizer }: HeroSectionProps) {
  return (
    <section className="relative bg-[#F8FCFE]">
      {/* Full-width mountain background with headline + sync banner */}
      <div className="relative w-full">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${landingAsset("landing/hero/full.png")})` }}
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#F8FCFE]"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[1400px] px-4 pt-10 pb-28 bp600:px-6 bp840:pt-16 bp840:pb-36 bp1200:px-10 bp1200:pt-20 bp1200:pb-44">
          <h1 className="max-w-2xl font-black uppercase leading-[1.05] tracking-tight text-[#0B2C47] text-3xl bp600:text-4xl bp840:max-w-3xl bp840:text-5xl bp1200:text-6xl">
            <span className="block">{heroContent.headline}</span>
            <span className="mt-1 block">
              {heroContent.headlineLead}{" "}
              <span className="text-primary">{heroContent.headlineHighlight}</span>
              <span aria-hidden>.</span>
            </span>
          </h1>
        </div>
      </div>

      {/* Video card + CTA on solid light background */}
      <div className="relative mx-auto -mt-16 max-w-3xl px-4 pb-12 bp840:-mt-24 bp840:pb-16 bp1200:-mt-28">
        <div className="relative overflow-hidden rounded-[var(--design-screen-corner-radius,30px)] border border-[var(--neutral-theme-200)] bg-card shadow-xl">
          <video
            className="aspect-video w-full bg-[var(--neutral-theme-100)] object-cover"
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
          <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-4 pt-12 text-center text-sm font-semibold text-white bp840:text-base">
            {heroContent.videoCaption}
          </p>
        </div>

        <div className="mt-8 flex justify-center bp840:mt-10">
          <Button
            size="lg"
            onClick={onSeeOptimizer}
            className="h-12 min-w-[220px] rounded-[var(--design-button-corner-radius,12px)] px-10 text-sm font-bold uppercase tracking-wide"
          >
            {heroContent.cta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
