import { firstStepsContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";

export function FirstStepsSection() {
  return (
    <section className="bg-[var(--page-bg)] px-4 py-14 bp840:py-20 bp1200:py-24">
      <div className="app-page-marketing">
        <img
          src={landingAsset("landing/first-steps/desktop-block.png")}
          alt={firstStepsContent.blockAlt}
          className="hidden h-auto w-full bp840:block"
          loading="lazy"
        />
        <img
          src={landingAsset("landing/first-steps/mobile-block.png")}
          alt={firstStepsContent.blockAlt}
          className="h-auto w-full bp840:hidden"
          loading="lazy"
        />
      </div>
    </section>
  );
}
