import { useEffect, useMemo, useState } from "react";
import { motion, animate } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  CreditCard,
  Flame,
  TrendingDown,
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizerContent } from "@/content/landing";

/** SVG text does not resolve `hsl(var(--token))` when tokens are hex; use explicit colors. */
const CHART_AXIS_TICK_FILL = "#ffffff";
const CHART_LEGEND_COLOR = "rgba(255, 255, 255, 0.85)";
const CHART_BORDER_COLOR = "rgba(255, 255, 255, 0.2)";
const CHART_TOOLTIP_TEXT = "#ffffff";

function AnimatedNumber({
  value,
  isWaste,
}: {
  value: number;
  isWaste?: boolean;
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

  const isRed = isWaste && value > 10;

  return (
    <motion.span
      className={`inline-block max-w-full font-mono tabular-nums tracking-tight ${
        isRed
          ? "text-destructive drop-shadow-[0_0_18px_rgba(248,113,113,0.7)]"
          : "text-primary drop-shadow-[0_0_18px_rgba(56,189,248,0.7)]"
      }`}
      animate={isRed ? { scale: [1, 1.04, 1] } : {}}
      transition={isRed ? { repeat: Infinity, duration: 2 } : {}}
    >
      ${displayValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </motion.span>
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
  /** Sum of all card balances used for the optimizer call */
  totalDebtAmount: number;
  isPending: boolean;
  onBack: () => void;
  /** Scroll to #plan (same as Get Started in nav) */
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
  const baselineMonthlyInterest = safeTotalDebt * (baselineApr / 100) / 12;
  const monthlyWaste = Math.max(0, (res?.dailyInterestWaste || 0) * 30.4375);
  const estimatedCurrentMonthlyInterest = baselineMonthlyInterest + monthlyWaste;
  const estimatedCurrentApr = safeTotalDebt > 0
    ? (estimatedCurrentMonthlyInterest * 12 * 100) / safeTotalDebt
    : baselineApr;
  const safeCurrentApr = Math.max(baselineApr, estimatedCurrentApr);

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthIndex = i + 1;
      const remainingDebt = Math.max(0, safeTotalDebt - monthlySavings * i);
      const baselineInterest = remainingDebt * (baselineApr / 100) / 12;
      const currentInterest = remainingDebt * (safeCurrentApr / 100) / 12;
      const wasteInterest = Math.max(0, currentInterest - baselineInterest);
      return {
        month: `M${monthIndex.toString().padStart(2, "0")}`,
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <Card className="bg-card border-border/60 overflow-hidden">
        <CardContent className="p-5 cabinet:p-6">
          <h3 className="text-base cabinet:text-lg font-black uppercase tracking-wide text-foreground">
            {optimizerContent.step3.chartTitle}
          </h3>
          <p className="mt-1 text-xs cabinet:text-sm text-muted-foreground">
            {optimizerContent.step3.chartSubtitle}
          </p>
          <div className="mt-4 h-56 cabinet:h-64 [&_.recharts-cartesian-axis-tick_text]:fill-white [&_.recharts-cartesian-axis-tick_text]:text-[11px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_BORDER_COLOR}
                  opacity={0.6}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: CHART_AXIS_TICK_FILL, fontSize: 11 }}
                  axisLine={{ stroke: CHART_BORDER_COLOR }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, Math.max(200, Math.ceil(chartMax / 100) * 100)]}
                  tick={{ fill: CHART_AXIS_TICK_FILL, fontSize: 11 }}
                  axisLine={{ stroke: CHART_BORDER_COLOR }}
                  tickLine={false}
                  tickFormatter={(v) => `$${Math.round(v)}`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59, 130, 246, 0.12)" }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: CHART_TOOLTIP_TEXT,
                  }}
                  labelStyle={{ color: CHART_TOOLTIP_TEXT }}
                  itemStyle={{ color: CHART_TOOLTIP_TEXT }}
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`,
                    name === "baselineInterest" ? "Interest at 8% baseline" : "Interest waste (current APR)",
                  ]}
                />
                <Legend
                  wrapperStyle={{ color: CHART_LEGEND_COLOR }}
                  formatter={(value) =>
                    value === "baselineInterest" ? (
                      <span style={{ color: CHART_LEGEND_COLOR }}>Interest at 8% baseline</span>
                    ) : (
                      <span style={{ color: CHART_LEGEND_COLOR }}>Interest waste (current APR)</span>
                    )
                  }
                />
                <Bar
                  dataKey="baselineInterest"
                  stackId="interest"
                  fill="#2AA198"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="wasteInterest"
                  stackId="interest"
                  fill="#D9480F"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 cabinet:grid-cols-3 gap-6">
        <Card className="bg-card border-border/50 @container min-w-0">
          <CardContent className="p-6 cabinet:p-8 flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0 flex-1 pr-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">
                Total Debt
              </p>
              <p className="text-[clamp(1.35rem,4cqi+0.85rem,3.1rem)] cabinet:text-[clamp(1.5rem,5cqi+0.75rem,3.25rem)] font-black leading-[1.05]">
                <AnimatedNumber value={totalDebtAmount} />
              </p>
            </div>
            <div className="h-12 w-12 cabinet:h-14 cabinet:w-14 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <CreditCard className="h-6 w-6 cabinet:h-7 cabinet:w-7 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-destructive/30 cabinet:col-span-2 relative overflow-hidden min-w-0 @container">
          <div className="absolute inset-0 bg-destructive/5" />
          <CardContent className="p-6 cabinet:p-8 flex items-center justify-between relative z-10 gap-4 min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-destructive uppercase tracking-[0.2em] mb-2">
                Daily Interest Waste
              </p>
              <div
                className="text-[clamp(1.5rem,3.5cqi+1.1rem,3.75rem)] cabinet:text-[clamp(1.75rem,4cqi+1rem,3.85rem)] font-black leading-none"
                aria-live="polite"
              >
                {showSkeleton ? (
                  <Skeleton className="h-14 w-56 max-w-full bg-card/60" />
                ) : (
                  <AnimatedNumber
                    value={res?.dailyInterestWaste || 0}
                    isWaste
                  />
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Gone, every single day.
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
              <Flame className="h-7 w-7 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 cabinet:grid-cols-2 gap-6">
        <Card className="bg-card border-primary/30 relative overflow-hidden min-w-0 @container">
          <div className="absolute inset-0 bg-primary/5" />
          <CardContent className="p-6 relative z-10 flex items-center justify-between gap-4 min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">
                Monthly Savings
              </p>
              <div
                className="text-[clamp(1.25rem,3cqi+0.9rem,2.25rem)] cabinet:text-[clamp(1.35rem,3.5cqi+0.85rem,2.5rem)] font-black leading-tight text-primary drop-shadow-[0_0_14px_rgba(59,130,246,0.55)]"
                aria-live="polite"
              >
                {showSkeleton ? (
                  <Skeleton className="h-9 w-40 max-w-full bg-card/60" />
                ) : (
                  <AnimatedNumber value={res?.monthlySavings || 0} />
                )}
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-primary/30 relative overflow-hidden min-w-0 @container">
          <div className="absolute inset-0 bg-primary/5" />
          <CardContent className="p-6 relative z-10 flex items-center justify-between gap-4 min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">
                Annual Savings
              </p>
              <div
                className="text-[clamp(1.25rem,3cqi+0.9rem,2.25rem)] cabinet:text-[clamp(1.35rem,3.5cqi+0.85rem,2.5rem)] font-black leading-tight text-primary drop-shadow-[0_0_14px_rgba(59,130,246,0.55)]"
                aria-live="polite"
              >
                {showSkeleton ? (
                  <Skeleton className="h-9 w-40 max-w-full bg-card/60" />
                ) : (
                  <AnimatedNumber value={res?.annualSavings || 0} />
                )}
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <TrendingDown className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <Button variant="ghost" onClick={onBack} className="font-bold sm:w-auto">
          <ChevronLeft className="mr-1 h-5 w-5" /> Back
        </Button>
        <div className="flex flex-col items-stretch sm:items-end w-full sm:w-auto">
          <Card className="bg-primary/10 border-primary/40 w-full sm:min-w-[370px]">
            <CardContent className="p-4 cabinet:p-5">
              <p className="text-center text-xl cabinet:text-2xl font-black uppercase tracking-wide text-foreground">
                Create a free APRly account and start saving today
              </p>
              <Button
                type="button"
                size="lg"
                onClick={onActivateClick}
                className="mt-4 w-full font-black text-base cabinet:text-lg h-14 shadow-[0_0_14px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.75)] transition-shadow"
              >
                {optimizerContent.step3.ctaLabel}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
