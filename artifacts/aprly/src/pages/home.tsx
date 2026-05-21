import { useEffect, useRef } from "react";
import { HeroSection } from "../components/landing/HeroSection";
import { StatsSection } from "../components/landing/StatsSection";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { OptimizerSection } from "../components/landing/OptimizerSection";
import { FaqSection } from "../components/landing/FaqSection";
import { PlanSection } from "../components/landing/PlanSection";
import { loadOptimizerSnapshot } from "@/lib/optimizerSnapshot";
import { useSignupCheckout } from "@/lib/signup-checkout-context";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const optimizerRef = useRef<HTMLElement>(null);
  const { openSignup } = useSignupCheckout();

  const scrollToPlan = () => {
    document.getElementById("plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("stripe_session");
    const cancelled = params.get("stripe_cancel");
    if (sid) {
      openSignup({ stripeSessionId: sid });
      const clean = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, "", clean);
    }
    if (cancelled) {
      toast({
        title: "Checkout canceled",
        description: "You can try again from the plan section.",
      });
      const clean = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, "", clean);
    }
  }, [openSignup]);

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
      <OptimizerSection ref={optimizerRef} onActivateClick={scrollToPlan} />
      <FaqSection />
      <PlanSection
        onActivateClick={() => {
          const snap = loadOptimizerSnapshot();
          openSignup({
            email: snap?.email?.trim() || null,
            name: snap?.name?.trim() || null,
          });
        }}
      />
    </div>
  );
}
