import { dashboardTabContent } from "@/content/dashboard-tab";
import { formatDashboardCurrency } from "@/lib/format-currency";

type PlanLeadTotalSavingsFooterProps = {
  totalYearlySavings: number;
};

export function PlanLeadTotalSavingsFooter({
  totalYearlySavings,
}: PlanLeadTotalSavingsFooterProps) {
  const copy = dashboardTabContent.planCard;

  return (
    <>
      <span className="app-header-screen-title text-[var(--success-theme-700)]">
        {copy.totalEstSaving}:
      </span>{" "}
      <span className="app-header-screen-title-bold text-[var(--success-theme-700)]">
        {formatDashboardCurrency(totalYearlySavings, 0, { spaceAfterDollar: false })}
        {copy.perYearShort}
      </span>
    </>
  );
}
