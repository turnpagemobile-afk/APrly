import { useEffect, useMemo, useRef, useState } from "react";
import { progressContent, type ProgressRatePair } from "@/content/landing";
import { ProgressRateBar, useProgressPillHeight } from "./ProgressRateBar";
import { cn } from "@/lib/utils";

const TITLE_BG = "var(--primary-theme-200)";
const CHART_BG = "var(--primary-theme-100)";

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
    <section className="bg-[var(--page-bg)] px-4 py-10 bp840:py-14 bp1200:py-16">
      <div className="app-page-marketing">
        <div
          className={cn(
            "overflow-hidden rounded-[28px]",
            "grid grid-cols-1",
            "bp600:grid-cols-[minmax(0,34%)_minmax(0,1fr)]",
            "bp840:grid-cols-[minmax(0,36%)_minmax(0,1fr)]",
            "bp1200:grid-cols-[minmax(0,38%)_minmax(0,1fr)]",
          )}
        >
          <div
            className="flex items-center px-5 py-6 bp600:min-h-[176px] bp600:px-6 bp600:py-8 bp840:min-h-[200px] bp840:px-7 bp840:py-9 bp1200:min-h-[228px] bp1200:px-9 bp1200:py-10"
            style={{ backgroundColor: TITLE_BG }}
          >
            <h2 className="font-extrabold uppercase leading-[1.12] tracking-tight text-[var(--primary-theme-900)] text-base bp600:text-lg bp840:text-xl bp1200:text-2xl">
              {progressContent.title}
            </h2>
          </div>

          <div
            className="flex flex-col justify-end px-5 pb-4 pt-5 bp600:min-h-[176px] bp600:px-6 bp600:pb-5 bp600:pt-6 bp840:min-h-[200px] bp840:px-7 bp840:pb-6 bp1200:min-h-[228px] bp1200:px-8"
            style={{ backgroundColor: CHART_BG }}
          >
            <ProgressRateChart
              rates={progressContent.ratesWide}
              className="mx-auto hidden w-full max-w-md bp600:flex"
            />
            <ProgressRateChart
              rates={progressContent.ratesNarrow}
              className="mx-auto flex w-full max-w-xs bp600:hidden"
            />
            <p className="mt-3 text-center text-[10px] leading-snug text-[var(--hint-text-color)] bp840:text-xs bp1200:text-sm">
              <span className="hidden bp600:inline">{progressContent.captionWide}</span>
              <span className="bp600:hidden">{progressContent.captionNarrow}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
