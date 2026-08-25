import { useCallback, useEffect, useRef } from "react";
import { HeroSection } from "../components/landing/HeroSection";
import { ProgressStatsSection } from "../components/landing/ProgressStatsSection";
import { LandingThemeEffect } from "../components/landing/LandingThemeEffect";
import { EasyStepsSection } from "../components/landing/EasyStepsSection";
import {
  OptimizerSection,
  type OptimizerSectionHandle,
} from "../components/landing/OptimizerSection";
import { WhySection } from "../components/landing/WhySection";
import { DashboardPreviewSection } from "../components/landing/DashboardPreviewSection";
import { StatsSection } from "../components/landing/StatsSection";
import { FaqSection } from "../components/landing/FaqSection";
import { LandingFooter } from "../components/landing/LandingFooter";
import { footerContent } from "@/content/landing";
import { loadOptimizerSnapshot } from "@/lib/optimizerSnapshot";
import { useSignupCheckout } from "@/lib/signup-checkout-context";
import { toast } from "@/hooks/use-toast";

const OPTIMIZER_FOCUS_DELAY_MS = 450;

export default function Home() {
  const optimizerRef = useRef<OptimizerSectionHandle>(null);
  const { openSignup } = useSignupCheckout();

  const openSignupFromSnapshot = useCallback(() => {
    const snap = loadOptimizerSnapshot();
    openSignup({
      email: snap?.email?.trim() || null,
      name: snap?.name?.trim() || null,
    });
  }, [openSignup]);

  const focusOptimizerDebt = useCallback(() => {
    window.setTimeout(() => {
      optimizerRef.current?.focusDebtInput();
    }, OPTIMIZER_FOCUS_DELAY_MS);
  }, []);

  const scrollToOptimizer = () => {
    optimizerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    focusOptimizerDebt();
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
      if (hash === "optimizer") focusOptimizerDebt();
    };
    const t = setTimeout(tryScroll, 60);
    return () => clearTimeout(t);
  }, [focusOptimizerDebt]);

  return (
    <div className="flex flex-col bg-[var(--page-bg)] text-[var(--neutral-theme-900)]">
      <LandingThemeEffect />
      <HeroSection onSeeOptimizer={scrollToOptimizer} />
      <ProgressStatsSection />
      <OptimizerSection ref={optimizerRef} onActivateClick={openSignupFromSnapshot} />
      <EasyStepsSection />
      <WhySection />
      <DashboardPreviewSection />
      <StatsSection />
      <FaqSection />
      <LandingFooter
        copyright={footerContent.copyrightTemplate.replace(
          "{year}",
          String(new Date().getFullYear()),
        )}
      />
    </div>
  );
}
