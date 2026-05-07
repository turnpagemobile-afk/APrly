import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLOGANS: { full: string; lead: string; accent: string }[] = [
  {
    full: "A window to the future. See where your money goes.",
    lead: "A window to the future.",
    accent: "See where your money goes.",
  },
  {
    full: "Stop feeding the banks. Take your money back.",
    lead: "Stop feeding the banks.",
    accent: "Take your money back.",
  },
  {
    full: "Your rate is bleeding you dry. We're the tourniquet.",
    lead: "Your rate is bleeding you dry.",
    accent: "We're the tourniquet.",
  },
  {
    full: "Every day you wait costs you real money.",
    lead: "Every day you wait",
    accent: "costs you real money.",
  },
  {
    full: "Crush your interest rate. Keep your paycheck.",
    lead: "Crush your interest rate.",
    accent: "Keep your paycheck.",
  },
];

function RotatingHeadline() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLOGANS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [paused]);

  const current = SLOGANS[index];

  return (
    <div
      className="relative min-h-[14rem] sm:min-h-[18rem] md:min-h-[22rem] lg:min-h-[26rem] flex items-center justify-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="sr-only" aria-live="polite">
        {current.full}
      </span>

      <AnimatePresence mode="wait">
        <motion.h1
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          aria-hidden
          className="absolute inset-0 flex flex-col items-center justify-center text-center font-black tracking-[-0.04em] leading-[0.95] text-5xl sm:text-7xl md:text-8xl lg:text-9xl"
        >
          <span className="block text-foreground">{current.lead}</span>
          <span className="block mt-2 md:mt-4 bg-gradient-to-r from-sky-300 via-primary to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(56,189,248,0.45)]">
            {current.accent}
          </span>
        </motion.h1>
      </AnimatePresence>

      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {SLOGANS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show slogan ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export interface HeroSectionProps {
  onSeeOptimizer: () => void;
  onSeePlan: () => void;
}

export function HeroSection({ onSeeOptimizer, onSeePlan }: HeroSectionProps) {
  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[800px] bg-primary/15 blur-[160px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-6xl">
        <RotatingHeadline />

        <p className="mx-auto mt-16 md:mt-24 max-w-2xl text-center text-xl md:text-2xl font-medium text-muted-foreground leading-relaxed">
          APRly is the wealth cockpit that hunts down credit card and personal
          loan interest — and gives it back.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={onSeeOptimizer}
            className="h-14 px-10 text-lg font-bold shadow-[0_0_30px_rgba(56,189,248,0.45)] hover:shadow-[0_0_40px_rgba(56,189,248,0.65)] transition-shadow"
          >
            See What You're Wasting
            <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={onSeePlan}
            className="h-14 px-8 text-lg font-semibold text-foreground/80 hover:text-foreground"
          >
            See the Plan — $39 one-time
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
