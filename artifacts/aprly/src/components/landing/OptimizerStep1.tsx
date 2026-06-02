import type { RefObject } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { optimizerContent } from "@/content/landing";
import { cn } from "@/lib/utils";

export interface OptimizerStep1Props {
  totalDebt: string;
  setTotalDebt: (v: string) => void;
  interestRate: string;
  setInterestRate: (v: string) => void;
  onNext: () => void;
  debtInputRef?: RefObject<HTMLInputElement | null>;
}

const auditInputClass = cn(
  "h-14 w-full rounded-[var(--design-button-corner-radius,12px)] border bg-white px-4",
  "text-lg font-semibold text-[var(--neutral-theme-900)] shadow-sm",
  "border-[var(--primary-theme-200)] placeholder:text-[var(--neutral-theme-400)]",
  "focus-visible:border-[var(--primary-theme-500)] focus-visible:ring-2 focus-visible:ring-[var(--primary-theme-300)]",
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
);

export function OptimizerStep1({
  totalDebt,
  setTotalDebt,
  interestRate,
  setInterestRate,
  onNext,
  debtInputRef,
}: OptimizerStep1Props) {
  const ready =
    !!totalDebt &&
    !!interestRate &&
    parseFloat(totalDebt) > 0 &&
    parseFloat(interestRate) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 bp600:space-y-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="debt"
          className="block text-left text-sm font-semibold text-[var(--neutral-theme-800)]"
        >
          {optimizerContent.step1.debtLabel}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--neutral-theme-500)]">
            $
          </span>
          <input
            ref={debtInputRef}
            id="debt"
            type="number"
            inputMode="decimal"
            placeholder="15 000"
            value={totalDebt}
            onChange={(e) => setTotalDebt(e.target.value)}
            className={cn(auditInputClass, "pl-10")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="rate"
          className="block text-left text-sm font-semibold text-[var(--neutral-theme-800)]"
        >
          {optimizerContent.step1.rateLabel}
        </label>
        <div className="relative">
          <input
            id="rate"
            type="number"
            inputMode="decimal"
            placeholder="24.99"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className={cn(auditInputClass, "pr-10")}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--neutral-theme-500)]">
            %
          </span>
        </div>
      </div>

      <div className="flex justify-center pt-2 bp600:pt-4">
        <Button
          type="button"
          size="lg"
          disabled={!ready}
          onClick={onNext}
          className="h-12 w-full min-w-0 rounded-[var(--design-button-corner-radius,12px)] bg-[var(--primary-theme-500)] px-10 text-sm font-bold uppercase tracking-wide text-white hover:bg-[var(--primary-theme-600)] bp600:w-auto bp600:min-w-[200px]"
        >
          {optimizerContent.step1.continue}
        </Button>
      </div>
    </motion.div>
  );
}
