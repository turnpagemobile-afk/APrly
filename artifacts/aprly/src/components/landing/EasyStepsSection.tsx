import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { easyStepsContent } from "@/content/landing";
import { cn } from "@/lib/utils";

type StepTone = "primary" | "teal" | "green";

const toneBg: Record<StepTone, string> = {
  primary: "bg-[var(--info-theme-500)]",
  teal: "bg-[var(--palette-maldives-maldives-500)]",
  green: "bg-[var(--secondary-theme-500)]",
};

/** Desktop row (≥840px) */
const ROW_H = "h-[240px] bp1200:h-[272px]" as const;

/** Figma: 30px horizontal, 20px vertical, 40px gap */
const CARD_RADIUS = "rounded-[20px] bp840:rounded-[24px] bp1200:rounded-[28px]";
const EXPANDED_PADDING = "box-border px-[30px] py-[20px]";

const ROTATE_MS = 2000;
const VIEWPORT_DELAY_MS = 500;
const DESKTOP_MQ = "(min-width: 840px)";

type Step = (typeof easyStepsContent.steps)[number];
type DigitVariant = "desktop" | "mobile";

function getDigitFontSize(variant: DigitVariant): CSSProperties {
  if (variant === "desktop") {
    return {
      fontSize: "var(--easy-step-digit-desktop)",
      lineHeight: 0.85,
    };
  }
  // Fit variable-height cards; desktop cap is too tall and clips unevenly per glyph.
  return {
    fontSize:
      "min(var(--easy-step-digit-mobile), calc((100cqw - 60px) / 0.85))",
    lineHeight: 0.85,
  };
}

function StepDigit({
  n,
  variant,
  faded = false,
}: {
  n: string;
  variant: DigitVariant;
  faded?: boolean;
}) {
  return (
    <span
      className={cn(
        "block shrink-0 whitespace-nowrap font-black tabular-nums leading-none tracking-tighter",
        faded ? "text-white/20" : "text-white",
      )}
      style={getDigitFontSize(variant)}
      aria-hidden
    >
      {n}
    </span>
  );
}

function StepDigitWatermark({
  n,
  variant,
  faded = false,
}: {
  n: string;
  variant: DigitVariant;
  faded?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-[20px_30px] z-0 flex items-end justify-end"
      aria-hidden
    >
      <StepDigit n={n} variant={variant} faded={faded} />
    </div>
  );
}

function ExpandedStepCopy({ step }: { step: Step }) {
  return (
    <div className="relative z-10 max-w-[58%] text-left bp600:max-w-[62%]">
      <p className="text-lg font-extrabold uppercase leading-tight tracking-tight bp840:text-xl bp1200:text-2xl">
        {step.title}
      </p>
      <p className="mt-2 text-sm leading-snug text-white/90 bp840:mt-3 bp1200:text-base bp1200:leading-relaxed">
        {step.body}
      </p>
    </div>
  );
}

function DesktopStepButton({
  step,
  isActive,
  onSelect,
}: {
  step: Step;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={step.title}
      aria-expanded={isActive}
      className={cn(
        "relative overflow-hidden text-left text-white transition-[flex-grow,width] duration-300 ease-out motion-reduce:transition-none",
        CARD_RADIUS,
        ROW_H,
        toneBg[step.tone],
        isActive
          ? "flex min-w-0 flex-[4] flex-col p-0"
          : cn(
              "flex w-max max-w-none shrink-0 flex-none items-end justify-end",
              EXPANDED_PADDING,
            ),
      )}
    >
      {isActive ? (
        <>
          <StepDigitWatermark n={step.number} variant="desktop" faded />
          <div className={cn("relative z-10 w-full", EXPANDED_PADDING)}>
            <ExpandedStepCopy step={step} />
          </div>
        </>
      ) : (
        <StepDigit n={step.number} variant="desktop" />
      )}
    </button>
  );
}

function MobileStepCard({ step }: { step: Step }) {
  return (
    <div
      className={cn(
        "@container relative w-full min-h-[200px] overflow-hidden text-white",
        CARD_RADIUS,
        toneBg[step.tone],
      )}
    >
      <div className={cn("relative z-10 w-full", EXPANDED_PADDING)}>
        <ExpandedStepCopy step={step} />
      </div>
      {/* Overlay matches card height from text; bottom-right like desktop expanded */}
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-end justify-end p-[20px_30px]"
        aria-hidden
      >
        <StepDigit n={step.number} variant="mobile" faded />
      </div>
    </div>
  );
}

function EasyStepsDesktopRow({
  active,
  onSelect,
  rowRef,
}: {
  active: number;
  onSelect: (index: number) => void;
  rowRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={rowRef}
      className={cn(
        "mt-8 hidden items-stretch gap-10 bp840:mt-12 bp840:flex",
        ROW_H,
      )}
    >
      {easyStepsContent.steps.map((step, i) => (
        <DesktopStepButton
          key={step.number}
          step={step}
          isActive={i === active}
          onSelect={() => onSelect(i)}
        />
      ))}
    </div>
  );
}

function EasyStepsMobileStack() {
  return (
    <div className="mt-8 flex flex-col gap-10 bp840:hidden">
      {easyStepsContent.steps.map((step) => (
        <MobileStepCard key={step.number} step={step} />
      ))}
    </div>
  );
}

export function EasyStepsSection() {
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const stepCount = easyStepsContent.steps.length;

  const clearRotateInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearViewportDelay = useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
  }, []);

  const startRotateInterval = useCallback(() => {
    clearRotateInterval();
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % stepCount);
    }, ROTATE_MS);
  }, [clearRotateInterval, stepCount]);

  const scheduleRotateAfterDelay = useCallback(() => {
    clearViewportDelay();
    clearRotateInterval();
    delayRef.current = setTimeout(() => {
      delayRef.current = null;
      startRotateInterval();
    }, VIEWPORT_DELAY_MS);
  }, [clearViewportDelay, clearRotateInterval, startRotateInterval]);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const mq = window.matchMedia(DESKTOP_MQ);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const stopPlayback = () => {
      clearViewportDelay();
      clearRotateInterval();
    };

    const syncPlayback = (isIntersecting: boolean) => {
      if (!mq.matches || reduced.matches) {
        stopPlayback();
        return;
      }
      if (isIntersecting && autoPlay) {
        scheduleRotateAfterDelay();
      } else {
        stopPlayback();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => syncPlayback(Boolean(entry?.isIntersecting)),
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);

    const onMediaChange = () => {
      if (!mq.matches || reduced.matches) {
        stopPlayback();
      }
    };
    mq.addEventListener("change", onMediaChange);
    reduced.addEventListener("change", onMediaChange);

    return () => {
      observer.disconnect();
      stopPlayback();
      mq.removeEventListener("change", onMediaChange);
      reduced.removeEventListener("change", onMediaChange);
    };
  }, [
    autoPlay,
    clearRotateInterval,
    clearViewportDelay,
    scheduleRotateAfterDelay,
  ]);

  const handleSelect = (index: number) => {
    setActive(index);
    setAutoPlay(false);
    clearViewportDelay();
    clearRotateInterval();
  };

  return (
    <section
      id="how"
      className={cn(
        "scroll-mt-24 bg-[var(--page-bg)] px-4 py-14 bp840:py-16 bp1200:py-20",
        "[--easy-step-digit-desktop:calc((240px-40px)/0.85)]",
        "bp1200:[--easy-step-digit-desktop:calc((272px-40px)/0.85)]",
        "[--easy-step-digit-mobile:calc((200px-40px)/0.85)]",
      )}
    >
      <div className="app-page-marketing">
        <h2 className="text-center text-xl font-extrabold uppercase tracking-tight text-[var(--primary-theme-900)] bp840:text-2xl bp1200:text-3xl">
          {easyStepsContent.title}
        </h2>

        <EasyStepsDesktopRow
          active={active}
          onSelect={handleSelect}
          rowRef={rowRef}
        />
        <EasyStepsMobileStack />
      </div>
    </section>
  );
}
