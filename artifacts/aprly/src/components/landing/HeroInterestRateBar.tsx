import { useEffect, useRef, useState } from "react";
import { animate, type AnimationPlaybackControls } from "framer-motion";
import { heroContent } from "@/content/landing";
import { cn } from "@/lib/utils";

const START_RATE = 22;
const END_RATE = 8;
const MARKER_22_PCT = 88;
const MARKER_8_PCT = 16;
const DURATION_S = 2.5;

const COLOR_ORANGE = "#FF693A";
const COLOR_GREEN = "#48BE38";

function lerpColor(t: number): string {
  const r = Math.round(255 + (72 - 255) * t);
  const g = Math.round(105 + (190 - 105) * t);
  const b = Math.round(58 + (56 - 58) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function fillPctToRate(pct: number): number {
  const t = (pct - MARKER_8_PCT) / (MARKER_22_PCT - MARKER_8_PCT);
  return Math.round(END_RATE + t * (START_RATE - END_RATE));
}

type HeroInterestRateBarProps = {
  className?: string;
};

function RateMarker({
  rate,
  leftPct,
  tone,
  visible = true,
}: {
  rate: number;
  leftPct: number;
  tone: "black" | "green";
  visible?: boolean;
}) {
  const bubbleBg =
    tone === "black"
      ? "bg-[var(--neutral-theme-1000)]"
      : "bg-[var(--action-default-color)]";
  const pointerBorder =
    tone === "black"
      ? "border-t-[var(--neutral-theme-1000)]"
      : "border-t-[var(--action-default-color)]";

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 z-20 -translate-x-1/2 transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{ left: `${leftPct}%` }}
      aria-hidden={!visible}
    >
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold leading-none text-white",
            "bp600:px-3 bp600:py-1.5 bp600:text-xs bp840:text-sm",
            bubbleBg,
          )}
        >
          {rate}%
        </span>
        <span
          className={cn(
            "mt-[-1px] h-0 w-0 border-x-[5px] border-x-transparent border-t-[6px]",
            pointerBorder,
          )}
          aria-hidden
        />
      </div>
    </div>
  );
}

export function HeroInterestRateBar({ className }: HeroInterestRateBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const [fillEndPct, setFillEndPct] = useState(MARKER_22_PCT);
  const [fillColor, setFillColor] = useState(COLOR_ORANGE);
  const [show8Marker, setShow8Marker] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      setFillEndPct(MARKER_8_PCT);
      setFillColor(COLOR_GREEN);
      setShow8Marker(true);
      hasAnimatedRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasAnimatedRef.current) return;
        hasAnimatedRef.current = true;
        observer.disconnect();

        controlsRef.current = animate(0, 1, {
          duration: DURATION_S,
          ease: [0.4, 0, 0.2, 1],
          onUpdate: (t) => {
            const pct = MARKER_22_PCT + t * (MARKER_8_PCT - MARKER_22_PCT);
            setFillEndPct(pct);
            setFillColor(lerpColor(t));
            if (pct <= MARKER_8_PCT + 0.5) {
              setShow8Marker(true);
            }
          },
          onComplete: () => {
            setFillEndPct(MARKER_8_PCT);
            setFillColor(COLOR_GREEN);
            setShow8Marker(true);
          },
        });
      },
      { threshold: 0.4, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      controlsRef.current?.stop();
    };
  }, []);

  const ariaValue = fillPctToRate(fillEndPct);

  return (
    <div
      ref={containerRef}
      className={cn("w-full max-w-full bp840:max-w-[560px]", className)}
    >
      <div className="relative pt-10 pb-1">
        <RateMarker
          rate={START_RATE}
          leftPct={MARKER_22_PCT}
          tone="black"
        />
        <RateMarker
          rate={END_RATE}
          leftPct={MARKER_8_PCT}
          tone="green"
          visible={show8Marker}
        />

        <div
          className={cn(
            "relative h-[30px] overflow-hidden rounded-[100px]",
            "border border-white/80 shadow-[var(--landing-shadow)]",
            "bp600:h-[34px] bp840:h-[38px]",
          )}
          style={{
            background:
              "linear-gradient(90deg, var(--neutral-theme-050) 0%, var(--neutral-theme-200) 100%)",
          }}
          role="progressbar"
          aria-valuemin={END_RATE}
          aria-valuemax={START_RATE}
          aria-valuenow={ariaValue}
          aria-label={heroContent.interestRateLabel}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-[100px]"
            style={{ width: `${fillEndPct}%`, backgroundColor: fillColor }}
          />
        </div>
      </div>

      <p className="app-text-p2-bold text-average mt-2 text-center uppercase tracking-widest">
        {heroContent.interestRateLabel}
      </p>
    </div>
  );
}
