import type { ReactNode } from "react";
import type { DashboardSummary } from "@workspace/api-client-react";
import { dashboardSummaryContent } from "@/content/dashboard-home";
import { formatMeltCountdown } from "@/lib/melt-countdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

type DashboardSummarySectionProps = {
  summary: DashboardSummary | undefined;
  hasActiveSubscription: boolean;
  onGoToDashboard: () => void;
};

export function DashboardSummarySection({
  summary,
  hasActiveSubscription,
  onGoToDashboard,
}: DashboardSummarySectionProps) {
  const totalDebt = summary?.totalDebt ?? 0;
  const savings = summary?.estimatedAnnualSavings ?? 0;
  const melt = formatMeltCountdown(totalDebt);

  return (
    <section className="px-4 py-12">
      <h2 className="text-center text-2xl font-extrabold tracking-tight">
        {dashboardSummaryContent.title}
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-4 cabinet:grid-cols-2">
        <SummaryCard className="border border-border/60 bg-card cabinet:col-span-2">
          <p className="text-sm font-medium text-muted-foreground">
            {dashboardSummaryContent.subscriptionLabel}
          </p>
          {hasActiveSubscription ? (
            <p className="mt-2 flex items-center gap-2 text-base font-bold text-foreground">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              {dashboardSummaryContent.subscriptionActive}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe to unlock full features.
            </p>
          )}
        </SummaryCard>

        <SummaryCard className="bg-[var(--danger-theme-100)]">
          <p className="text-sm font-medium text-foreground/80">
            {dashboardSummaryContent.totalDebtLabel}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
            {formatCurrency(totalDebt)}
          </p>
        </SummaryCard>

        <SummaryCard className="bg-[var(--info-theme-100)]">
          <p className="text-sm font-medium text-foreground/80">
            {dashboardSummaryContent.savingsLabel}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
            {formatCurrency(savings)}
          </p>
        </SummaryCard>

        <SummaryCard className="border border-border/60 bg-card cabinet:col-span-2">
          <p className="text-sm font-medium text-muted-foreground">
            {dashboardSummaryContent.meltLabel}
          </p>
          <p className="mt-2 text-xl font-extrabold tracking-tight text-foreground">
            {melt.label}
          </p>
        </SummaryCard>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          type="button"
          size="lg"
          className="min-w-[12rem] font-semibold"
          onClick={onGoToDashboard}
        >
          {dashboardSummaryContent.goToDashboard}
        </Button>
      </div>
    </section>
  );
}

function SummaryCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl p-5", className)}>{children}</div>
  );
}
