import { useEffect, useMemo, useState } from "react";
import { motion, animate } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PillButton } from "@/components/shared/PillButton";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizerContent } from "@/content/landing";
import { cn } from "@/lib/utils";

const CHART_AXIS = "#17690E";
const CHART_GRID = "#E1E3E6";
const CHART_BASELINE = "#10B981";
const CHART_WASTE = "#FF9E7F";

function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.8,
      onUpdate: (v) => setDisplayValue(v),
      ease: "easeOut",
    });
    return () => {
      controls.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className={cn("font-mono tabular-nums tracking-tight", className)}>
      $
      {displayValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}

function ResultStatCard({
  value,
  label,
  variant,
  isPending,
  className,
}: {
  value: number;
  label: string;
  variant: "debt" | "waste" | "monthly" | "annual";
  isPending?: boolean;
  className?: string;
}) {
  const styles = {
    debt: {
      wrap: "border-2 border-[var(--info-theme-400)] bg-[var(--info-theme-100)]",
      value: "text-[var(--info-theme-500)]",
      label: "text-[var(--info-theme-900)]",
    },
    waste: {
      wrap: "border-2 border-[var(--accent-theme-400)] bg-[var(--accent-theme-100)]",
      value: "text-[var(--accent-theme-500)]",
      label: "text-[var(--accent-theme-900)]",
    },
    monthly: {
      wrap: "border-2 border-[var(--success-theme-400)] bg-[var(--success-theme-100)]",
      value: "text-[var(--success-theme-600)]",
      label: "text-[var(--success-theme-900)]",
    },
    annual: {
      wrap: "border-0 bg-[var(--success-theme-500)]",
      value: "text-[var(--neutral-theme-000)]",
      label: "text-[var(--neutral-theme-000)]",
    },
  }[variant];

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col items-center justify-center rounded-[var(--design-card-corner-radius-small,24px)] px-4 py-5 text-center",
        styles.wrap,
        className,
      )}
    >
      <div
        className={cn("app-header-screen-title-bold leading-none", styles.value)}
        aria-live="polite"
      >
        {isPending ? (
          <Skeleton className="mx-auto h-9 w-32 bg-black/10" />
        ) : (
          <AnimatedNumber value={value} />
        )}
      </div>
      <p className={cn("app-text-p2-bold mt-2", styles.label)}>{label}</p>
    </article>
  );
}

export interface OptimizerStep3Props {
  res:
    | {
        dailyInterestWaste?: number;
        monthlySavings?: number;
        annualSavings?: number;
      }
    | undefined;
  totalDebtAmount: number;
  isPending: boolean;
  onBack: () => void;
  onActivateClick: () => void;
}

export function OptimizerStep3({
  res,
  totalDebtAmount,
  isPending,
  onBack,
  onActivateClick,
}: OptimizerStep3Props) {
  const baselineApr = 8;
  const showSkeleton = isPending && !res;
  const safeTotalDebt = Math.max(0, totalDebtAmount || 0);
  const monthlySavings = Math.max(0, res?.monthlySavings || 0);
  const baselineMonthlyInterest = (safeTotalDebt * (baselineApr / 100)) / 12;
  const monthlyWaste = Math.max(0, (res?.dailyInterestWaste || 0) * 30.4375);
  const estimatedCurrentMonthlyInterest = baselineMonthlyInterest + monthlyWaste;
  const estimatedCurrentApr =
    safeTotalDebt > 0
      ? (estimatedCurrentMonthlyInterest * 12 * 100) / safeTotalDebt
      : baselineApr;
  const safeCurrentApr = Math.max(baselineApr, estimatedCurrentApr);

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthIndex = i + 1;
      const remainingDebt = Math.max(0, safeTotalDebt - monthlySavings * i);
      const baselineInterest = (remainingDebt * (baselineApr / 100)) / 12;
      const currentInterest = (remainingDebt * (safeCurrentApr / 100)) / 12;
      const wasteInterest = Math.max(0, currentInterest - baselineInterest);
      return {
        month: `MON ${monthIndex}`,
        baselineInterest,
        wasteInterest,
      };
    });
  }, [baselineApr, monthlySavings, safeCurrentApr, safeTotalDebt]);

  const chartMax = useMemo(
    () =>
      chartData.reduce(
        (max, row) => Math.max(max, row.baselineInterest + row.wasteInterest),
        0,
      ),
    [chartData],
  );

  const yMax = Math.max(200, Math.ceil(chartMax / 100) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 bp840:space-y-10"
    >
      <h3 className="app-header-h4 text-center text-title">
        {optimizerContent.step3.readyTitle}{" "}
        <span className="text-action">
          {optimizerContent.step3.readyHighlight}
        </span>{" "}
        {optimizerContent.step3.readySuffix}
      </h3>

      <div className="grid grid-cols-1 gap-3 bp600:grid-cols-2 bp840:grid-cols-4 bp840:gap-4">
        <ResultStatCard
          value={totalDebtAmount}
          label={optimizerContent.step3.metrics.totalDebt}
          variant="debt"
          className="order-1"
        />
        <ResultStatCard
          value={res?.dailyInterestWaste || 0}
          label={optimizerContent.step3.metrics.dailyWaste}
          variant="waste"
          isPending={showSkeleton}
          className="order-2 bp600:order-3 bp840:order-2"
        />
        <ResultStatCard
          value={res?.monthlySavings || 0}
          label={optimizerContent.step3.metrics.monthlySaving}
          variant="monthly"
          isPending={showSkeleton}
          className="order-3 bp600:order-2 bp840:order-3"
        />
        <ResultStatCard
          value={res?.annualSavings || 0}
          label={optimizerContent.step3.metrics.annualSaving}
          variant="annual"
          isPending={showSkeleton}
          className="order-4"
        />
      </div>

      <div className="rounded-[var(--design-card-corner-radius-small,24px)] border border-[var(--primary-theme-200)] bg-[var(--card-1lvl-bg-color)] p-5 shadow-[var(--cabinet-card-shadow)] bp600:p-6">
        <h4 className="app-text-p1-bold text-title">{optimizerContent.step3.chartTitle}</h4>
        <div className="mt-4 flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full bg-[var(--accent-theme-400)]"
              aria-hidden
            />
            <span className="font-medium text-[var(--accent-theme-900)]">
              {optimizerContent.step3.chartLegendWaste}
            </span>
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full bg-[var(--success-theme-500)]"
              aria-hidden
            />
            <span className="font-medium text-[var(--success-theme-900)]">
              {optimizerContent.step3.chartLegendBaseline}
            </span>
          </span>
        </div>
        <div className="mt-4 h-56 bp600:h-72 [&_.recharts-cartesian-axis-tick_text]:fill-[#0B2C47] [&_.recharts-cartesian-axis-tick_text]:text-[10px] bp600:[&_.recharts-cartesian-axis-tick_text]:text-[11px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 4, bottom: 48 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_GRID}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: CHART_AXIS, fontSize: 10 }}
                axisLine={{ stroke: CHART_GRID }}
                tickLine={false}
                interval={0}
                angle={-90}
                textAnchor="end"
                height={56}
              />
              <YAxis
                domain={[0, yMax]}
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
                axisLine={{ stroke: CHART_GRID }}
                tickLine={false}
                tickFormatter={(v) => `$${Math.round(v)}`}
                width={48}
              />
              <Tooltip
                cursor={{ fill: "rgba(38, 147, 237, 0.08)" }}
                contentStyle={{
                  background: "#fff",
                  border: `1px solid ${CHART_GRID}`,
                  borderRadius: "8px",
                  color: CHART_AXIS,
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`,
                  name === "baselineInterest"
                    ? optimizerContent.step3.chartLegendBaseline
                    : optimizerContent.step3.chartLegendWaste,
                ]}
              />
              <Legend content={() => null} />
              <Bar
                dataKey="baselineInterest"
                stackId="interest"
                fill={CHART_BASELINE}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="wasteInterest"
                stackId="interest"
                fill={CHART_WASTE}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col gap-4 bp600:items-center bp600:gap-5">
        <div className="mx-auto flex w-full flex-col gap-4 bp600:max-w-[360px] bp600:gap-5">
          <div className="w-full rounded-[var(--design-card-corner-radius-small,24px)] bg-[var(--action-default-color)] px-6 py-8 text-center bp600:px-8 bp600:py-10">
            <p className="app-header-screen-title text-[var(--neutral-theme-000)]">
              {optimizerContent.step3.ctaLead}
            </p>
            <div className="mt-6 flex justify-center">
              <PillButton
                type="button"
                variant="special"
                size="lg"
                onClick={onActivateClick}
                className="w-full"
              >
                {optimizerContent.step3.ctaLabel}
              </PillButton>
            </div>
          </div>

          <div className="flex justify-center">
            <PillButton
              type="button"
              variant="secondary"
              size="lg"
              onClick={onBack}
              className="w-[calc((100%-12px)/2)] min-w-0"
            >
              {optimizerContent.step3.back}
            </PillButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
