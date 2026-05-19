import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { FaqSection } from "@/components/landing/FaqSection";
import { dashboardFaqContent } from "@/content/dashboard-home";
import { DashboardPromoCard } from "@/components/dashboard/home/DashboardPromoCard";
import { DashboardHeroSection } from "@/components/dashboard/home/DashboardHeroSection";
import { DashboardStatsRow } from "@/components/dashboard/home/DashboardStatsRow";
import { DashboardHowItWorksSection } from "@/components/dashboard/home/DashboardHowItWorksSection";
import { DashboardSummarySection } from "@/components/dashboard/home/DashboardSummarySection";

type DashboardHomeTabProps = {
  subscriptionActive: boolean;
  onGoToDashboard: () => void;
};

export function DashboardHomeTab({
  subscriptionActive,
  onGoToDashboard,
}: DashboardHomeTabProps) {
  const summary = useGetDashboardSummary();

  if (summary.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  if (summary.isError) {
    return (
      <div className="app-page-cabinet py-16 text-center">
        <p className="text-destructive">Could not load your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="app-page-cabinet w-full pb-8 cabinet:py-4">
      <DashboardPromoCard subscriptionActive={subscriptionActive} />
      <DashboardHeroSection subscriptionActive={subscriptionActive} />
      <DashboardStatsRow />
      <DashboardHowItWorksSection />
      <DashboardSummarySection
        summary={summary.data}
        hasActiveSubscription={subscriptionActive}
        onGoToDashboard={onGoToDashboard}
      />
      <FaqSection content={dashboardFaqContent} className="bg-muted/30" />
    </div>
  );
}
