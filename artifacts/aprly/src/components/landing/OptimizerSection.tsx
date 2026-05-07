import { forwardRef, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useCalculateOptimization } from "@workspace/api-client-react";
import { VoiceStore } from "../layout";
import { OptimizerStep1 } from "./OptimizerStep1";
import { OptimizerStep2 } from "./OptimizerStep2";
import { OptimizerStep3 } from "./OptimizerStep3";
import type { CardEntry } from "./types";

const TARGET_APR = 8;

export const OptimizerSection = forwardRef<HTMLElement>(function OptimizerSection(
  _props,
  ref,
) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [totalDebt, setTotalDebt] = useState<string>("15000");
  const [interestRate, setInterestRate] = useState<string>("24.99");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accounts, setAccounts] = useState<CardEntry[]>([
    { brand: "", balance: "", rate: "" },
  ]);

  const calculateOpt = useCalculateOptimization();

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
      const debt = parseFloat(totalDebt);
      const rate = parseFloat(interestRate);
      if (!isNaN(debt) && !isNaN(rate)) {
        calculateOpt.mutate({
          data: { totalDebt: debt, interestRate: rate, targetRate: TARGET_APR },
        });
      }
    }, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalDebt, interestRate]);

  const res = calculateOpt.data;

  return (
    <section
      ref={ref}
      id="optimizer"
      className="px-4 py-20 md:py-28"
    >
      <div className="container mx-auto max-w-5xl space-y-10">
        <div className="max-w-3xl">
          <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-primary mb-4">
            {step === 1
              ? "Step 1 of 3 — The Damage"
              : step === 2
                ? "Step 2 of 3 — The Cards"
                : "Step 3 of 3 — The Plan"}
          </p>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
            {step === 1
              ? "Two numbers. That's all."
              : step === 2
                ? "Tell us about each card."
                : "Here's what we save you."}
          </h2>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">
            {step === 1
              ? "Just punch in your total debt and rate. We'll show the leak in real time."
              : step === 2
                ? "The more we know, the harder we negotiate. Add every card you carry."
                : "Activate APRly and we start clawing this back, today."}
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em]">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step >= (n as 1 | 2 | 3)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border/60 text-muted-foreground"
                }`}
              >
                {step > n ? <Check className="h-4 w-4" /> : n}
              </div>
              {n < 3 && (
                <div
                  className={`h-0.5 w-10 md:w-20 transition-colors ${
                    step > n ? "bg-primary" : "bg-border/60"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <OptimizerStep1
              key="step1"
              totalDebt={totalDebt}
              setTotalDebt={setTotalDebt}
              interestRate={interestRate}
              setInterestRate={setInterestRate}
              onNext={() => setStep(2)}
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
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <OptimizerStep3
              key="step3"
              res={res}
              totalDebt={totalDebt}
              isPending={calculateOpt.isPending}
              onBack={() => setStep(2)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
});
