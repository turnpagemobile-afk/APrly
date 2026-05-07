import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  CreditCard,
  Flame,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
      className={`font-mono tabular-nums ${
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
  totalDebt: string;
  isPending: boolean;
  onBack: () => void;
}

export function OptimizerStep3({
  res,
  totalDebt,
  isPending,
  onBack,
}: OptimizerStep3Props) {
  const showSkeleton = isPending && !res;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border/50">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">
                Total Debt
              </p>
              <p className="text-4xl md:text-5xl font-black tracking-tight">
                <AnimatedNumber value={parseFloat(totalDebt) || 0} />
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <CreditCard className="h-7 w-7 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-destructive/30 md:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-destructive/5" />
          <CardContent className="p-8 flex items-center justify-between relative z-10 gap-6">
            <div>
              <p className="text-xs font-bold text-destructive uppercase tracking-[0.2em] mb-2">
                Daily Interest Waste
              </p>
              <p className="text-5xl md:text-6xl font-black tracking-tight leading-none">
                {showSkeleton ? (
                  <Skeleton className="h-14 w-56 bg-card/60" />
                ) : (
                  <AnimatedNumber
                    value={res?.dailyInterestWaste || 0}
                    isWaste
                  />
                )}
              </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-primary/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <CardContent className="p-6 relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">
                Monthly Savings
              </p>
              <p className="text-3xl md:text-4xl font-black tracking-tight text-primary drop-shadow-[0_0_14px_rgba(59,130,246,0.55)]">
                {showSkeleton ? (
                  <Skeleton className="h-9 w-40 bg-card/60" />
                ) : (
                  <AnimatedNumber value={res?.monthlySavings || 0} />
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-primary/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <CardContent className="p-6 relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">
                Annual Savings
              </p>
              <p className="text-3xl md:text-4xl font-black tracking-tight text-primary drop-shadow-[0_0_14px_rgba(59,130,246,0.55)]">
                {showSkeleton ? (
                  <Skeleton className="h-9 w-40 bg-card/60" />
                ) : (
                  <AnimatedNumber value={res?.annualSavings || 0} />
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <TrendingDown className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-black text-lg tracking-tight">
                Auto-detect your debts
              </p>
              <p className="text-sm text-muted-foreground">
                Connect your bank to pull every balance and rate in one tap.
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Coming soon — Plaid Sandbox in upcoming release.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <Button variant="ghost" onClick={onBack} className="font-bold sm:w-auto">
          <ChevronLeft className="mr-1 h-5 w-5" /> Back
        </Button>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex flex-col items-stretch sm:items-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled
              aria-disabled="true"
              className="font-black uppercase tracking-wider text-base px-6 h-14"
            >
              Save My Plan
            </Button>
            <p className="mt-1 text-xs text-muted-foreground sm:text-right">
              Available after stage launch
            </p>
          </div>
          <div className="flex flex-col items-stretch sm:items-end">
            <Button
              type="button"
              size="lg"
              disabled
              aria-disabled="true"
              className="font-black uppercase tracking-wider text-base px-8 h-14 shadow-[0_0_18px_rgba(59,130,246,0.55)] disabled:shadow-none"
            >
              Activate Audit Access — $39 one-time
            </Button>
            <p className="mt-1 text-xs text-muted-foreground sm:text-right">
              Available after stage launch (Stripe pending)
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
