import { useEffect, useMemo, useRef, useState } from "react";
import { progressContent, type ProgressRatePair } from "@/content/landing";
import { ProgressRateBar, useProgressPillHeight } from "./ProgressRateBar";
import { cn } from "@/lib/utils";

function heightPercents(rates: readonly ProgressRatePair[]) {
  const maxHigh = Math.max(...rates.map((r) => r.high), 1);
  return rates.map((r) => (r.high / maxHigh) * 100);
}

function ProgressRateChart({
  rates,
  className,
}: {
  rates: readonly ProgressRatePair[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const heights = useMemo(() => heightPercents(rates), [rates]);
  const pillHeight = useProgressPillHeight();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-28 items-end justify-center gap-2 bp840:h-36 bp840:gap-2.5 bp1200:h-44 bp1200:gap-3",
        className,
      )}
      role="img"
      aria-label={progressContent.title}
    >
      {rates.map((pair, i) => (
        <ProgressRateBar
          key={i}
          rates={pair}
          heightPct={heights[i] ?? 0}
          revealed={revealed}
          staggerIndex={i}
          pillHeight={pillHeight}
        />
      ))}
    </div>
  );
}

export function ProgressStatsSection() {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <section className="bg-[var(--page-bg)] px-4 py-10 bp840:py-14 bp1200:py-16">
      <div className="app-page-marketing">
        <div
          className={cn(
            "overflow-hidden rounded-[var(--design-card-corner-radius,32px)]",
            "bg-[var(--card-1lvl-bg-color)] p-10",
            "shadow-[var(--landing-shadow)]",
            "grid grid-cols-1 gap-8",
            "bp840:grid-cols-[minmax(0,42%)_minmax(0,1fr)] bp840:gap-10",
          )}
        >
          <div className="flex flex-col justify-center">
            <h2 className="app-header-h3 text-title">{progressContent.title}</h2>
            {detailsOpen ? (
              <p className="app-text-p1-regular mt-4 text-[var(--neutral-theme-900)] bp840:mt-5">
                {progressContent.body}
              </p>
            ) : null}
            <button
              type="button"
              className="app-button-button-l-m mt-5 w-fit cursor-pointer text-[var(--action-default-color)] transition-opacity hover:opacity-80"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((open) => !open)}
            >
              {detailsOpen ? progressContent.showLess : progressContent.learnMore}
            </button>
          </div>

          <div className="flex flex-col justify-end">
            <ProgressRateChart
              rates={progressContent.ratesWide}
              className="mx-auto hidden w-full max-w-md bp600:flex"
            />
            <ProgressRateChart
              rates={progressContent.ratesNarrow}
              className="mx-auto flex w-full max-w-xs bp600:hidden"
            />
            <p className="app-text-p2-regular text-average mt-3 text-center">
              <span className="hidden bp600:inline">{progressContent.captionWide}</span>
              <span className="bp600:hidden">{progressContent.captionNarrow}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
