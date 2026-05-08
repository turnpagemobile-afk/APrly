import { useEffect, useRef } from "react";
import { HeroSection } from "../components/landing/HeroSection";
import { StatsSection } from "../components/landing/StatsSection";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { OptimizerSection } from "../components/landing/OptimizerSection";
import { FaqSection } from "../components/landing/FaqSection";
import { PlanSection } from "../components/landing/PlanSection";

export default function Home() {
  const optimizerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const tryScroll = () => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const t = setTimeout(tryScroll, 60);
    return () => clearTimeout(t);
  }, []);

  const handleSeeOptimizer = () => {
    optimizerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="flex flex-col">
      <HeroSection onSeeOptimizer={handleSeeOptimizer} />
      <StatsSection />
      <HowItWorksSection />
      <OptimizerSection ref={optimizerRef} />
      <FaqSection />
      <PlanSection />
    </div>
  );
}
