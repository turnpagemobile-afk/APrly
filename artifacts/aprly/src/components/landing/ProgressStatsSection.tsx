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
  return (
    <section className="bg-[var(--primary-theme-100)] px-4 py-10 bp840:py-14 bp1200:py-16">
      <div className="app-page-marketing">
        <div
          className={cn(
            "overflow-hidden rounded-[28px] bg-white shadow-sm",
            "grid grid-cols-1",
            "bp840:grid-cols-[minmax(0,42%)_minmax(0,1fr)]",
          )}
        >
          <div className="flex flex-col justify-center px-6 py-8 bp840:px-8 bp840:py-10 bp1200:px-10 bp1200:py-12">
            <p className="app-text-p2-bold text-hint">{progressContent.subtitle}</p>
            <h2 className="app-header-h4 text-title mt-3 bp840:mt-4">{progressContent.title}</h2>
            <p className="app-text-p1-regular text-average mt-4 bp840:mt-5">{progressContent.body}</p>
          </div>

          <div className="flex flex-col justify-end bg-[var(--primary-theme-050)] px-5 pb-4 pt-5 bp840:px-7 bp840:pb-6 bp840:pt-8">
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
