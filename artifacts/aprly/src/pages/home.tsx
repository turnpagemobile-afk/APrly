import { useEffect, useRef, useState } from "react";
import { HeroSection } from "../components/landing/HeroSection";
import { StatsSection } from "../components/landing/StatsSection";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { OptimizerSection } from "../components/landing/OptimizerSection";
import { FaqSection } from "../components/landing/FaqSection";
import { PlanSection } from "../components/landing/PlanSection";
import { SignupCheckoutWizard } from "../components/auth/SignupCheckoutWizard";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const optimizerRef = useRef<HTMLElement>(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [stripeReturnSessionId, setStripeReturnSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("stripe_session");
    const cancelled = params.get("stripe_cancel");
    if (sid) {
      setStripeReturnSessionId(sid);
      setSignupOpen(true);
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
  }, []);

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
      <SignupCheckoutWizard
        open={signupOpen}
        onOpenChange={(open) => {
          setSignupOpen(open);
          if (!open) setStripeReturnSessionId(null);
        }}
        initialStripeSessionId={stripeReturnSessionId}
      />
      <HeroSection onSeeOptimizer={handleSeeOptimizer} />
      <StatsSection />
      <HowItWorksSection />
      <OptimizerSection ref={optimizerRef} />
      <FaqSection />
      <PlanSection
        onActivateClick={() => {
          setStripeReturnSessionId(null);
          setSignupOpen(true);
        }}
      />
    </div>
  );
}
