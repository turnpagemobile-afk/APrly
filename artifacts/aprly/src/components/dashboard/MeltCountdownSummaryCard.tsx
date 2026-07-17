import type { MeltCountdownDisplay } from "@/lib/melt-countdown";
import { cn } from "@/lib/utils";

type MeltCountdownSummaryCardProps = {
  display: MeltCountdownDisplay;
  label: string;
};

function MeltDurationPair({
  value,
  unit,
}: {
  value: number | string;
  unit: string;
}) {
  return (
    <>
      <span className="dash-melt-number">{value}</span>
      <span className="dash-melt-unit">{unit}</span>
    </>
  );
}

function MeltCountdownValue({ display }: { display: MeltCountdownDisplay }) {
  switch (display.kind) {
    case "empty":
      return <span className="dash-melt-unit">—</span>;
    case "yearsMonths":
      return (
        <>
          <MeltDurationPair
            value={display.years}
            unit={display.years === 1 ? "year" : "years"}
          />
          <MeltDurationPair
            value={display.months}
            unit={display.months === 1 ? "month" : "months"}
          />
        </>
      );
    case "yearsOnly":
      return (
        <MeltDurationPair
          value={display.years}
          unit={display.years === 1 ? "year" : "years"}
        />
      );
    case "monthsOnly":
      return (
        <MeltDurationPair
          value={display.months}
          unit={display.months === 1 ? "month" : "months"}
        />
      );
    case "cap":
      return (
        <>
          <span className="dash-melt-number">{display.years}+</span>
          <span className="dash-melt-unit">years</span>
        </>
      );
    case "fallback":
      return <span className="dash-melt-unit">{display.text}</span>;
  }
}

export function MeltCountdownSummaryCard({
  display,
  label,
}: MeltCountdownSummaryCardProps) {
  return (
    <div
      className={cn(
        "dash-summary-tile border-2 border-[var(--success-theme-400)] bg-[var(--success-theme-100)]",
      )}
    >
      <div className="dash-metric-card-stack">
        <div className="dash-melt-value-row">
          <MeltCountdownValue display={display} />
        </div>
        <p className="dash-display-label text-[var(--success-theme-900)]">{label}</p>
      </div>
    </div>
  );
}
