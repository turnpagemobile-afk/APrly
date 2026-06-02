import { useEffect, useMemo, useState } from "react";
import { motion, animate } from "framer-motion";
import { ChevronLeft } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizerContent } from "@/content/landing";
import { cn } from "@/lib/utils";

const CHART_AXIS = "#0B2C47";
const CHART_GRID = "#D4E9FB";
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
}: {
  value: number;
  label: string;
  variant: "debt" | "waste" | "monthly" | "annual";
  isPending?: boolean;
}) {
  const styles = {
    debt: {
      wrap: "border-[var(--primary-theme-200)] bg-white",
      value: "text-[var(--primary-theme-900)]",
      label: "text-[var(--primary-theme-900)]",
    },
    waste: {
      wrap: "border-[var(--accent-theme-200)] bg-[var(--accent-theme-100)]",
      value: "text-[var(--accent-theme-500)]",
      label: "text-[var(--primary-theme-900)]",
    },
    monthly: {
      wrap: "border-[var(--secondary-theme-200)] bg-[var(--secondary-theme-100)]",
      value: "text-[var(--secondary-theme-600)]",
      label: "text-[var(--primary-theme-900)]",
    },
    annual: {
      wrap: "border-[var(--secondary-theme-600)] bg-[var(--secondary-theme-500)]",
      value: "text-white",
      label: "text-white",
    },
  }[variant];

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col items-center justify-center rounded-[var(--design-button-corner-radius,12px)] border px-4 py-5 text-center",
        styles.wrap,
      )}
    >
      <div
        className={cn(
          "text-2xl font-extrabold leading-none bp600:text-3xl",
          styles.value,
        )}
        aria-live="polite"
      >
        {isPending ? (
          <Skeleton className="mx-auto h-9 w-32 bg-black/10" />
        ) : (
          <AnimatedNumber value={value} />
        )}
      </div>
      <p
        className={cn(
          "mt-2 text-xs font-extrabold uppercase tracking-wide",
          styles.label,
        )}
      >
        {label}
      </p>
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
      <h3 className="text-center text-lg font-extrabold uppercase tracking-tight text-[var(--primary-theme-900)] bp600:text-xl">
        {optimizerContent.step3.readyTitle}{" "}
        <span className="text-[var(--secondary-theme-500)]">
          {optimizerContent.step3.readyHighlight}
        </span>{" "}
        {optimizerContent.step3.readySuffix}
      </h3>

      <div className="grid grid-cols-2 gap-3 bp840:grid-cols-4 bp840:gap-4">
        <ResultStatCard
          value={totalDebtAmount}
          label="Total Debt"
          variant="debt"
        />
        <ResultStatCard
          value={res?.dailyInterestWaste || 0}
          label="Daily Interest Waste"
          variant="waste"
          isPending={showSkeleton}
        />
        <ResultStatCard
          value={res?.monthlySavings || 0}
          label="Monthly Saving"
          variant="monthly"
          isPending={showSkeleton}
        />
        <ResultStatCard
          value={res?.annualSavings || 0}
          label="Annual Saving"
          variant="annual"
          isPending={showSkeleton}
        />
      </div>

      <div className="rounded-[var(--design-button-corner-radius,12px)] border border-[var(--primary-theme-200)] bg-white p-5 bp600:p-6">
        <h4 className="text-sm font-extrabold uppercase tracking-tight text-[var(--primary-theme-900)] bp600:text-base">
          {optimizerContent.step3.chartTitle}
        </h4>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-[var(--neutral-theme-800)] bp600:text-sm">
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: CHART_WASTE }}
              aria-hidden
            />
            {optimizerContent.step3.chartLegendWaste}
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: CHART_BASELINE }}
              aria-hidden
            />
            {optimizerContent.step3.chartLegendBaseline}
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

      <div className="flex flex-col items-center gap-4">
        <p className="max-w-xl text-center text-sm font-extrabold uppercase tracking-wide text-[var(--primary-theme-900)] bp600:text-base">
          {optimizerContent.step3.ctaLead}
        </p>
        <div className="flex w-full flex-col items-stretch gap-3 bp600:flex-row bp600:items-center bp600:justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="order-2 font-bold uppercase text-[var(--primary-theme-700)] bp600:order-1"
          >
            <ChevronLeft className="mr-1 h-5 w-5" /> {optimizerContent.step3.back}
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={onActivateClick}
            className="order-1 h-12 w-full rounded-[var(--design-button-corner-radius,12px)] bg-[var(--primary-theme-500)] px-8 text-sm font-bold uppercase tracking-wide text-white hover:bg-[var(--primary-theme-600)] bp600:order-2 bp600:w-auto bp600:min-w-[220px]"
          >
            {optimizerContent.step3.ctaLabel}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
