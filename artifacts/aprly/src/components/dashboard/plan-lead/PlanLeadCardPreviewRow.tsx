import type { LeadCardItem } from "@workspace/api-client-react";
import { formatDashboardCurrency } from "@/lib/format-currency";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { cn } from "@/lib/utils";

type PlanLeadCardPreviewRowProps = {
  card: LeadCardItem;
  className?: string;
  variant?: "planCard" | "planDetail";
  canDelete?: boolean;
  cardsCount?: number;
  onDelete?: () => void;
  isDeleting?: boolean;
};

function RateChips({
  currentApr,
  targetApr,
  className,
}: {
  currentApr: number;
  targetApr: number;
  className?: string;
}) {
  const copy = dashboardTabContent.planCard;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span className="dash-plan-card-chip dash-plan-card-rate">
        <span className="app-text-p1-regular text-average">{copy.rateLabel}</span>{" "}
        <span className="app-text-p1-bold text-average">{currentApr.toFixed(2)}%</span>
      </span>
      <img
        src={cabinetAsset("cabinet/dashboard/litl-arrow.svg")}
        alt=""
        aria-hidden
        className="h-3 w-3.5 shrink-0"
      />
      <span className="dash-plan-card-chip dash-plan-card-rate-target">
        <span className="app-text-p1-bold text-[var(--success-theme-700)]">
          {targetApr.toFixed(1)}%
        </span>
      </span>
    </div>
  );
}

function BalanceChip({ balance, className }: { balance: number; className?: string }) {
  const copy = dashboardTabContent.planCard;

  return (
    <span className={cn("dash-plan-card-chip dash-plan-card-balance", className)}>
      <span className="app-text-p1-regular text-average">{copy.balanceLabel}</span>{" "}
      <span className="app-text-p1-bold text-average">
        {formatDashboardCurrency(balance, 2, { spaceAfterDollar: false })}
      </span>
    </span>
  );
}

function SavingsChip({
  estimatedAnnualSavings,
  className,
}: {
  estimatedAnnualSavings: number;
  className?: string;
}) {
  const copy = dashboardTabContent.planCard;

  return (
    <span className={cn("dash-plan-card-chip dash-plan-card-saving", className)}>
      <span className="app-text-p1-regular text-neutral-000">{copy.estimatedSavings}:</span>{" "}
      <span className="app-text-p1-bold text-neutral-000">
        {formatDashboardCurrency(estimatedAnnualSavings, 0, { spaceAfterDollar: false })}
        {copy.perYearShort}
      </span>
    </span>
  );
}

export function PlanLeadCardPreviewRow({
  card,
  className,
  variant = "planCard",
  canDelete = false,
  cardsCount = 1,
  onDelete,
  isDeleting = false,
}: PlanLeadCardPreviewRowProps) {
  const showDelete = variant === "planDetail" && canDelete && cardsCount > 1 && onDelete;

  if (variant === "planDetail") {
    return (
      <div
        className={cn(
          "dash-plan-card-widget dash-plan-card-widget--detail",
          showDelete && "dash-plan-card-widget--detail-deletable",
          className,
        )}
      >
        <span className="dash-plan-card-grid-icon shrink-0" aria-hidden>
          <img
            src={cabinetAsset("cabinet/dashboard/card-label-icon.svg")}
            alt=""
            aria-hidden
            className="h-11 w-11"
          />
        </span>

        <p className="dash-plan-card-grid-brand app-header-subheadline-bold text-average truncate">
          {card.brand}
        </p>

        {showDelete ? (
          <button
            type="button"
            className="dash-plan-card-grid-delete h-11 w-11 items-center justify-center"
            aria-label={`Delete ${card.brand}`}
            disabled={isDeleting}
            onClick={onDelete}
          >
            <img
              src={cabinetAsset("cabinet/dashboard/trash.svg")}
              alt=""
              aria-hidden
              className="h-6 w-6"
            />
          </button>
        ) : null}

        <RateChips
          currentApr={card.currentApr}
          targetApr={card.targetApr}
          className="dash-plan-card-grid-rates"
        />

        <BalanceChip balance={card.balance} className="dash-plan-card-grid-balance" />
        <SavingsChip
          estimatedAnnualSavings={card.estimatedAnnualSavings}
          className="dash-plan-card-grid-savings"
        />
      </div>
    );
  }

  return (
    <div className={cn("dash-plan-card-widget", className)}>
      <div className="flex items-start justify-between gap-3 bp600:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="dash-plan-card-icon-wrap shrink-0" aria-hidden>
            <img
              src={cabinetAsset("cabinet/dashboard/card-label-icon.svg")}
              alt=""
              aria-hidden
              className="h-11 w-11"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="app-header-subheadline-bold text-average truncate">{card.brand}</p>
            <RateChips
              currentApr={card.currentApr}
              targetApr={card.targetApr}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <BalanceChip balance={card.balance} />
          <SavingsChip estimatedAnnualSavings={card.estimatedAnnualSavings} />
        </div>
      </div>
    </div>
  );
}
