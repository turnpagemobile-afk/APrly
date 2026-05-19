import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  CreditCard,
  Flame,
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
  const showSkeleton = isPending && !res;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
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
              <p className="text-[clamp(1.5rem,3.5cqi+1.1rem,3.75rem)] cabinet:text-[clamp(1.75rem,4cqi+1rem,3.85rem)] font-black leading-none">
                {showSkeleton ? (
                  <Skeleton className="h-14 w-56 max-w-full bg-card/60" />
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

      <div className="grid grid-cols-1 cabinet:grid-cols-2 gap-6">
        <Card className="bg-card border-primary/30 relative overflow-hidden min-w-0 @container">
          <div className="absolute inset-0 bg-primary/5" />
          <CardContent className="p-6 relative z-10 flex items-center justify-between gap-4 min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">
                Monthly Savings
              </p>
              <p className="text-[clamp(1.25rem,3cqi+0.9rem,2.25rem)] cabinet:text-[clamp(1.35rem,3.5cqi+0.85rem,2.5rem)] font-black leading-tight text-primary drop-shadow-[0_0_14px_rgba(59,130,246,0.55)]">
                {showSkeleton ? (
                  <Skeleton className="h-9 w-40 max-w-full bg-card/60" />
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

        <Card className="bg-card border-primary/30 relative overflow-hidden min-w-0 @container">
          <div className="absolute inset-0 bg-primary/5" />
          <CardContent className="p-6 relative z-10 flex items-center justify-between gap-4 min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">
                Annual Savings
              </p>
              <p className="text-[clamp(1.25rem,3cqi+0.9rem,2.25rem)] cabinet:text-[clamp(1.35rem,3.5cqi+0.85rem,2.5rem)] font-black leading-tight text-primary drop-shadow-[0_0_14px_rgba(59,130,246,0.55)]">
                {showSkeleton ? (
                  <Skeleton className="h-9 w-40 max-w-full bg-card/60" />
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <Button variant="ghost" onClick={onBack} className="font-bold sm:w-auto">
          <ChevronLeft className="mr-1 h-5 w-5" /> Back
        </Button>
        <div className="flex flex-col items-stretch sm:items-end">
          <Button
            type="button"
            size="lg"
            onClick={onActivateClick}
            className="font-black uppercase tracking-wider text-base px-8 h-14 shadow-[0_0_18px_rgba(59,130,246,0.55)] hover:shadow-[0_0_24px_rgba(59,130,246,0.8)] transition-shadow"
          >
            Activate APRly — $39/mo
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
