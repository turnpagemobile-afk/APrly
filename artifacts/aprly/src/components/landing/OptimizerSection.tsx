import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useCalculateOptimization } from "@workspace/api-client-react";
import { VoiceStore } from "../layout";
import { OptimizerStep1 } from "./OptimizerStep1";
import { OptimizerStep2 } from "./OptimizerStep2";
import { OptimizerStep3 } from "./OptimizerStep3";
import type { CardEntry } from "./types";
import { aggregateCardBalances } from "./optimizerAccounts";
import { saveOptimizerSnapshot } from "@/lib/optimizerSnapshot";
import { optimizerContent } from "@/content/landing";

const TARGET_APR = 8;

type OptimizerSectionProps = {
  onActivateClick: () => void;
};

export const OptimizerSection = forwardRef<HTMLElement, OptimizerSectionProps>(
  function OptimizerSection({ onActivateClick }, ref) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [totalDebt, setTotalDebt] = useState<string>("15000");
  const [interestRate, setInterestRate] = useState<string>("24.99");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accounts, setAccounts] = useState<CardEntry[]>([
    { brand: "", balance: "", rate: "" },
  ]);

  const calculateOpt = useCalculateOptimization();

  const goToStep2 = useCallback(() => {
    setAccounts((prev) => {
      const next = [...prev];
      const first = next[0] ?? { brand: "", balance: "", rate: "" };
      next[0] = {
        ...first,
        balance: totalDebt,
        rate: interestRate,
      };
      return next;
    });
    setStep(2);
  }, [totalDebt, interestRate]);

  useEffect(() => {
    const unsub = VoiceStore.subscribe((data) => {
      if (data.totalDebt !== undefined) setTotalDebt(data.totalDebt.toString());
      if (data.interestRate !== undefined)
        setInterestRate(data.interestRate.toString());
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (step === 1) {
        const debt = parseFloat(totalDebt);
        const rate = parseFloat(interestRate);
        if (!Number.isNaN(debt) && !Number.isNaN(rate) && debt > 0 && rate > 0) {
          calculateOpt.mutate({
            data: { totalDebt: debt, interestRate: rate, targetRate: TARGET_APR },
          });
        }
        return;
      }

      const agg = aggregateCardBalances(accounts);
      if (agg) {
        calculateOpt.mutate({
          data: {
            totalDebt: agg.totalDebt,
            interestRate: agg.blendedRate,
            targetRate: TARGET_APR,
          },
        });
      }
    }, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, totalDebt, interestRate, accounts]);

  const res = calculateOpt.data;

  const step3TotalDebt = useMemo(() => {
    const agg = aggregateCardBalances(accounts);
    if (agg) return agg.totalDebt;
    const fallback = parseFloat(totalDebt);
    return Number.isNaN(fallback) ? 0 : fallback;
  }, [accounts, totalDebt]);

  const goToStep3 = useCallback(() => {
    const agg = aggregateCardBalances(accounts);
    const fallbackDebt = parseFloat(totalDebt);
    saveOptimizerSnapshot({
      name,
      email,
      accounts,
      totalDebt: agg?.totalDebt ?? (Number.isNaN(fallbackDebt) ? 0 : fallbackDebt),
      blendedRate: agg?.blendedRate,
      dailyInterestWaste: res?.dailyInterestWaste,
      monthlySavings: res?.monthlySavings,
      annualSavings: res?.annualSavings,
    });
    setStep(3);
  }, [accounts, name, email, totalDebt, res]);

  return (
    <section
      ref={ref}
      id="optimizer"
      className="px-4 py-16 md:py-24 scroll-mt-24"
    >
      <div className="container mx-auto max-w-3xl space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {optimizerContent.title}
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            {optimizerContent.subtitle}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 text-sm font-bold">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    step >= (n as 1 | 2 | 3)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border/60 text-muted-foreground"
                  }`}
                >
                  {step > n ? <Check className="h-4 w-4" /> : n}
                </div>
                {n < 3 && (
                  <div
                    className={`h-px w-8 md:w-12 border-t border-dotted ${
                      step > n ? "border-primary" : "border-border/60"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            {optimizerContent.stepLabels[step]}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <OptimizerStep1
              key="step1"
              totalDebt={totalDebt}
              setTotalDebt={setTotalDebt}
              interestRate={interestRate}
              setInterestRate={setInterestRate}
              onNext={goToStep2}
            />
          )}
          {step === 2 && (
            <OptimizerStep2
              key="step2"
              accounts={accounts}
              setAccounts={setAccounts}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              onBack={() => setStep(1)}
              onNext={goToStep3}
            />
          )}
          {step === 3 && (
            <OptimizerStep3
              key="step3"
              res={res}
              totalDebtAmount={step3TotalDebt}
              isPending={calculateOpt.isPending}
              onBack={() => setStep(2)}
              onActivateClick={onActivateClick}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
  },
);
