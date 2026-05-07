import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { HeroSection } from "../components/landing/HeroSection";
import { OptimizerSection } from "../components/landing/OptimizerSection";
import { TrustBar } from "../components/landing/TrustBar";
import { PlanSection } from "../components/landing/PlanSection";

function smoothScrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const optimizerRef = useRef<HTMLElement>(null);
  const [, setLocation] = useLocation();

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

  const handleSeePlan = () => {
    smoothScrollToId("plan");
    setLocation("/#plan", { replace: true });
  };

  return (
    <div className="flex flex-col">
      <HeroSection
        onSeeOptimizer={handleSeeOptimizer}
        onSeePlan={handleSeePlan}
      />
      <OptimizerSection ref={optimizerRef} />
      <TrustBar />
      <PlanSection />
    </div>
  );
}
