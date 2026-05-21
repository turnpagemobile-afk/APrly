import {
  getGetDashboardSummaryQueryKey,
  useGetDashboardSummary,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const {
    data: summaryData,
    isPending,
    isLoading,
    isError,
    isFetched,
  } = useGetDashboardSummary();

  const retrySummary = () =>
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });

  const showLoading = isPending || isLoading;

  if (showLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="app-page-cabinet py-16 text-center">
        <p className="text-destructive">Could not load your dashboard.</p>
        <button
          type="button"
          className="mt-6 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          onClick={() => void retrySummary()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (isFetched && !summaryData) {
    return (
      <div className="app-page-cabinet py-16 text-center">
        <p className="text-muted-foreground">No summary data available yet.</p>
        <button
          type="button"
          className="mt-6 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          onClick={() => void retrySummary()}
        >
          Retry
        </button>
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
        summary={summaryData}
        hasActiveSubscription={subscriptionActive}
        onGoToDashboard={onGoToDashboard}
      />
      <FaqSection content={dashboardFaqContent} className="bg-muted/30" />
    </div>
  );
}
