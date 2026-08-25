import { ProgressStatsSection } from "@/components/landing/ProgressStatsSection";
import { EasyStepsSection } from "@/components/landing/EasyStepsSection";
import { WhySection } from "@/components/landing/WhySection";
import { DashboardPreviewSection } from "@/components/landing/DashboardPreviewSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { cabinetHomeContent, dashboardFaqContent } from "@/content/dashboard-home";

type DashboardHomeTabProps = {
  onGoToDashboard: () => void;
};

/** Cabinet Home = landing sections 1–2, 4–8 (no Start Audit). Footer via DashboardShell. */
export function DashboardHomeTab({ onGoToDashboard }: DashboardHomeTabProps) {
  return (
    <div className="w-full">
      <HeroSection
        onCabinetCta={onGoToDashboard}
        ctaLabel={cabinetHomeContent.goToDashboardCta}
      />
      <ProgressStatsSection />
      <EasyStepsSection />
      <WhySection />
      <DashboardPreviewSection />
      <StatsSection />
      <FaqSection content={dashboardFaqContent} />
    </div>
  );
}
