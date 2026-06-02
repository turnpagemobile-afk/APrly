import { functionsContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";

const FUNCTIONS_GRADIENT =
  "linear-gradient(90deg, rgba(248,252,254,0) 0%, rgba(214,235,255,0.45) 18%, rgba(186,220,255,0.85) 42%, #A8D4F5 72%, #8FC8F0 100%)";

/** Pale, semi-transparent APRLY watermark behind the bullet list. */
const WATERMARK_COLOR = "rgba(168, 212, 248, 0.3)";

function FunctionsWatermark({ variant }: { variant: "desktop" | "mobile" }) {
  const isDesktop = variant === "desktop";
  return (
    <span
      className="pointer-events-none absolute left-[-0.25rem] top-0 z-0 -translate-y-[58%] select-none font-black uppercase leading-[0.82] tracking-[-0.04em]"
      style={{
        color: WATERMARK_COLOR,
        fontSize: isDesktop
          ? "clamp(4rem, 10vw, 7rem)"
          : "clamp(2.75rem, 18vw, 4rem)",
      }}
      aria-hidden
    >
      {functionsContent.watermark}
    </span>
  );
}

function FeatureBullets({ className }: { className?: string }) {
  return (
    <ul
      className={cn("list-disc space-y-5 pl-6 marker:text-[#202226]", className)}
    >
      {functionsContent.items.map((line) => (
        <li
          key={line}
          className="text-base font-extrabold uppercase leading-snug tracking-tight text-[#202226] bp840:text-xl bp1200:text-2xl"
        >
          {line}
        </li>
      ))}
    </ul>
  );
}

export function FunctionsSection() {
  return (
    <section className="relative bg-[#F8FCFE] px-4 py-12 bp840:py-16 bp1200:py-20">
      <div className="app-page-marketing relative">
        {/* ——— >=840: list on white + gradient panel with image ——— */}
        <div className="relative hidden min-h-[260px] bp840:block bp1200:min-h-[300px]">
          <div className="grid grid-cols-1 items-stretch bp1200:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
            <div className="relative flex items-center py-6 pr-4 bp1200:py-10 bp1200:pr-8">
              <div className="relative inline-block">
                <FunctionsWatermark variant="desktop" />
                <FeatureBullets className="relative z-10 max-w-xl" />
              </div>
            </div>

            <div
              className="relative min-h-[240px] overflow-hidden rounded-r-[28px] rounded-l-md bp1200:min-h-[280px] bp1200:rounded-r-[36px]"
              style={{ background: FUNCTIONS_GRADIENT }}
            >
              <img
                src={landingAsset("landing/functions/landing-functions-photo.png")}
                alt={functionsContent.imageAlt}
                className="absolute bottom-0 right-0 h-[108%] w-auto max-w-none object-contain object-bottom-right"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* ——— <840: watermark + list only (Figma narrow) ——— */}
        <div className="relative bp840:hidden">
          <div className="relative inline-block pt-6">
            <FunctionsWatermark variant="mobile" />
            <FeatureBullets className="relative z-10 max-w-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
