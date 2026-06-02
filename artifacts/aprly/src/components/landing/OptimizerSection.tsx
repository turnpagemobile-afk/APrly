import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence } from "framer-motion";
import { useCalculateOptimization, useUpsertGuestLead } from "@workspace/api-client-react";
import { VoiceStore } from "../layout";
import { OptimizerStep1 } from "./OptimizerStep1";
import { OptimizerStep2 } from "./OptimizerStep2";
import { OptimizerStep3 } from "./OptimizerStep3";
import { OptimizerStepPills } from "./OptimizerStepPills";
import type { CardEntry } from "./types";
import { aggregateCardBalances } from "./optimizerAccounts";
import { getOrCreateGuestSessionId } from "@/lib/guest-session";
import { saveOptimizerSnapshot, snapshotCardsForImport } from "@/lib/optimizerSnapshot";
import { optimizerContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";

const TARGET_APR = 8;

export type OptimizerSectionHandle = {
  scrollIntoView: (options?: ScrollIntoViewOptions) => void;
  focusDebtInput: () => void;
};

type OptimizerSectionProps = {
  onActivateClick: () => void;
};

export const OptimizerSection = forwardRef<OptimizerSectionHandle, OptimizerSectionProps>(
  function OptimizerSection({ onActivateClick }, ref) {
    const sectionRef = useRef<HTMLElement>(null);
    const debtInputRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [totalDebt, setTotalDebt] = useState<string>("15000");
    const [interestRate, setInterestRate] = useState<string>("24.99");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [accounts, setAccounts] = useState<CardEntry[]>([
      { brand: "", balance: "", rate: "" },
    ]);

    const calculateOpt = useCalculateOptimization();
    const upsertGuestLead = useUpsertGuestLead();

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
      const snapshot = {
        name,
        email,
        accounts,
        totalDebt: agg?.totalDebt ?? (Number.isNaN(fallbackDebt) ? 0 : fallbackDebt),
        blendedRate: agg?.blendedRate,
        dailyInterestWaste: res?.dailyInterestWaste,
        monthlySavings: res?.monthlySavings,
        annualSavings: res?.annualSavings,
      };
      saveOptimizerSnapshot(snapshot);

      const cards = snapshotCardsForImport(snapshot);
      if (cards.length) {
        void upsertGuestLead.mutateAsync({
          data: {
            guestSessionId: getOrCreateGuestSessionId(),
            name: name.trim() || undefined,
            email: email.trim() || undefined,
            cards,
          },
        });
      }

      setStep(3);
    }, [accounts, name, email, totalDebt, res, upsertGuestLead]);

    const focusDebtInput = useCallback(() => {
      setStep(1);
      requestAnimationFrame(() => {
        debtInputRef.current?.focus({ preventScroll: true });
      });
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        scrollIntoView: (options) => {
          sectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
            ...options,
          });
        },
        focusDebtInput,
      }),
      [focusDebtInput],
    );

    return (
      <section
        id="optimizer"
        ref={sectionRef}
        className="scroll-mt-24 px-4 py-14 bp840:py-20 bp1200:py-24"
      >
        <div className="app-page-marketing">
          <div
            className={cn(
              "relative overflow-hidden rounded-[var(--design-card-corner-radius-small,24px)]",
              "border border-[var(--primary-theme-200)]",
              "bg-gradient-to-br from-[var(--primary-theme-050)] via-[var(--primary-theme-100)] to-white",
              "shadow-sm",
            )}
          >
            <img
              src={landingAsset("landing/audit/man.png")}
              alt=""
              width={258}
              height={296}
              className="pointer-events-none absolute right-0 top-0 z-0 h-[296px] w-[258px] object-contain object-right-top opacity-20"
              aria-hidden
            />
            <img
              src={landingAsset("landing/audit/peyzaj.png")}
              alt=""
              width={757}
              height={191}
              className="pointer-events-none absolute bottom-0 right-0 z-0 h-[191px] w-[757px] object-right object-bottom opacity-20"
              aria-hidden
            />

            <div className="relative z-10 p-6 bp600:p-8 bp1200:p-10">
              <header className="text-left">
                <h2 className="text-xl font-extrabold uppercase tracking-tight text-[var(--primary-theme-500)] bp600:text-2xl bp1200:text-3xl">
                  {optimizerContent.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--hint-text-color)] bp600:mt-3 bp600:text-base">
                  {optimizerContent.subtitle}
                </p>
                <OptimizerStepPills step={step} />
                <p className="sr-only">{optimizerContent.stepLabels[step]}</p>
              </header>

              <div
                className={cn(
                  "mx-auto mt-8 min-w-0 w-full",
                  step === 1 && "max-w-lg",
                  step === 2 && "max-w-3xl",
                  step === 3 && "max-w-4xl",
                )}
              >
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <OptimizerStep1
                      key="step1"
                      totalDebt={totalDebt}
                      setTotalDebt={setTotalDebt}
                      interestRate={interestRate}
                      setInterestRate={setInterestRate}
                      onNext={goToStep2}
                      debtInputRef={debtInputRef}
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
            </div>
          </div>
        </div>
      </section>
    );
  },
);
