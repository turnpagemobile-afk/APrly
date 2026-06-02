import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";
import type { ProgressRatePair } from "@/content/landing";

type ProgressRateBarProps = {
  rates: ProgressRatePair;
  heightPct: number;
  revealed: boolean;
  staggerIndex: number;
  pillHeight: string;
};

const STAGGER_S = 0.22;
const SHRINK_S = 2.2;

export function useProgressPillHeight(): string {
  const [height, setHeight] = useState("1.75rem");

  useEffect(() => {
    const sync = () => {
      if (window.matchMedia("(min-width: 1200px)").matches) {
        setHeight("2.75rem");
      } else if (window.matchMedia("(min-width: 840px)").matches) {
        setHeight("2.25rem");
      } else {
        setHeight("1.75rem");
      }
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return height;
}

function BlueRateLabel({
  from,
  to,
  active,
  delayS,
}: {
  from: number;
  to: number;
  active: boolean;
  delayS: number;
}) {
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    if (!active) {
      setDisplay(from);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(to);
      return;
    }

    setDisplay(from);
    let finished = false;

    const controls = animate(from, to, {
      duration: SHRINK_S,
      delay: delayS,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => {
        if (!finished) setDisplay(Math.round(v));
      },
      onComplete: () => {
        finished = true;
        setDisplay(to);
      },
    });

    return () => {
      controls.stop();
    };
  }, [active, from, to, delayS]);

  return (
    <span className="text-[10px] font-bold leading-none text-white bp840:text-[11px]">
      {display}%
    </span>
  );
}

export function ProgressRateBar({
  rates,
  heightPct,
  revealed,
  staggerIndex,
  pillHeight,
}: ProgressRateBarProps) {
  const { high, low } = rates;
  const delayS = staggerIndex * STAGGER_S;

  return (
    <div
      className="flex w-6 shrink-0 flex-col items-center justify-end bp840:w-8 bp1200:w-10"
      style={{ height: `${heightPct}%` }}
    >
      <div className="relative flex h-full w-full min-h-[4.5rem] flex-col justify-end">
        <motion.div
          className="absolute inset-0 rounded-full bg-[var(--accent-theme-500)]"
          initial={false}
          animate={{ opacity: revealed ? 0 : 1 }}
          transition={{ duration: 0.45, delay: revealed ? delayS : 0 }}
          aria-hidden={revealed}
        />

        <div className="flex h-full w-full flex-col justify-end">
          <motion.div
            className="relative min-h-0 w-full flex-1 rounded-t-full"
            initial={false}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ duration: 0.55, delay: revealed ? delayS + 0.15 : 0 }}
            style={{
              background:
                "linear-gradient(180deg, var(--accent-theme-500) 0%, var(--accent-theme-300) 50%, rgba(255, 225, 216, 0.12) 100%)",
            }}
          >
            <span className="pointer-events-none absolute inset-x-0 top-2 text-center text-[10px] font-bold leading-none text-white bp840:top-2.5 bp840:text-[11px]">
              {high}%
            </span>
          </motion.div>

          <motion.div
            className="relative z-10 flex w-full shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--primary-theme-500)]"
            initial={{ height: "100%" }}
            animate={{ height: revealed ? pillHeight : "100%" }}
            transition={{
              duration: SHRINK_S,
              delay: delayS,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <BlueRateLabel
              from={high}
              to={low}
              active={revealed}
              delayS={delayS}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
