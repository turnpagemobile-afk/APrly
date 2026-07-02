import { FunctionsSection } from "@/components/landing/FunctionsSection";
import { ProgressStatsSection } from "@/components/landing/ProgressStatsSection";
import { EasyStepsSection } from "@/components/landing/EasyStepsSection";
import { WhySection } from "@/components/landing/WhySection";
import { DashboardPreviewSection } from "@/components/landing/DashboardPreviewSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FooterCtaSection } from "@/components/landing/FooterCtaSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { cabinetHomeContent, dashboardFaqContent } from "@/content/dashboard-home";
import { planContent } from "@/content/landing";

type DashboardHomeTabProps = {
  onGoToDashboard: () => void;
};

export function DashboardHomeTab({ onGoToDashboard }: DashboardHomeTabProps) {
  return (
    <div className="w-full">
      <HeroSection
        onCabinetCta={onGoToDashboard}
        ctaLabel={cabinetHomeContent.goToDashboardCta}
      />
      <FunctionsSection />
      <ProgressStatsSection />
      <EasyStepsSection />
      <WhySection />
      <DashboardPreviewSection />
      <StatsSection />
      <FaqSection content={dashboardFaqContent} />
      <FooterCtaSection
        onAuditClick={onGoToDashboard}
        ctaLabel={cabinetHomeContent.goToDashboardCta}
        title={planContent.title}
      />
    </div>
  );
}
