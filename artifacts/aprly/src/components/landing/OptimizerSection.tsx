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
import { usePlaidCardImport } from "@/components/cards/usePlaidCardImport";
import { OptimizerStep1 } from "./OptimizerStep1";
import { OptimizerStep2 } from "./OptimizerStep2";
import { OptimizerStep3 } from "./OptimizerStep3";
import { OptimizerStepPills } from "./OptimizerStepPills";
import type { CardEntry } from "./types";
import { aggregateCardBalances, accountsAreComplete } from "./optimizerAccounts";
import { getOrCreateGuestSessionId } from "@/lib/guest-session";
import { saveOptimizerSnapshot, snapshotCardsForImport } from "@/lib/optimizerSnapshot";
import { optimizerContent } from "@/content/landing";
import { cn } from "@/lib/utils";

const TARGET_APR = 8;
/** Matches AnimatePresence step transition duration in OptimizerStep*.tsx */
const STEP_TRANSITION_MS = 380;

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
    const connectButtonRef = useRef<HTMLButtonElement>(null);
    const skipStepScrollRef = useRef(true);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [totalDebt, setTotalDebt] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [accounts, setAccounts] = useState<CardEntry[]>([]);

    const { startPlaid, plaidBusy } = usePlaidCardImport(setAccounts);
    const calculateOpt = useCalculateOptimization();
    const upsertGuestLead = useUpsertGuestLead();

    const advanceToStep2FromAccounts = useCallback((nextAccounts: CardEntry[]) => {
      const agg = aggregateCardBalances(nextAccounts);
      if (!agg || !accountsAreComplete(nextAccounts)) return;
      setTotalDebt(String(agg.totalDebt));
      setInterestRate(String(agg.blendedRate));
      setStep(2);
    }, []);

    useEffect(() => {
      if (step !== 1 || !accounts.length) return;
      advanceToStep2FromAccounts(accounts);
    }, [accounts, step, advanceToStep2FromAccounts]);

    useEffect(() => {
      const timeout = setTimeout(() => {
        if (step === 1) return;

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
    }, [step, accounts]);

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
        name: "",
        email: "",
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
            cards,
          },
        });
      }

      setStep(3);
    }, [accounts, totalDebt, res, upsertGuestLead]);

    const focusDebtInput = useCallback(() => {
      setStep(1);
      requestAnimationFrame(() => {
        connectButtonRef.current?.focus({ preventScroll: true });
      });
    }, []);

    const onPlaidConnect = useCallback(() => {
      void startPlaid();
    }, [startPlaid]);

    const scrollAuditIntoView = useCallback(() => {
      window.setTimeout(() => {
        sectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, STEP_TRANSITION_MS);
    }, []);

    useEffect(() => {
      if (skipStepScrollRef.current) {
        skipStepScrollRef.current = false;
        return;
      }
      scrollAuditIntoView();
    }, [step, scrollAuditIntoView]);

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
        className="scroll-mt-24 bg-[var(--secondary-theme-200)] px-4 py-14 bp840:py-20 bp1200:py-24"
      >
        <div className="app-page-marketing app-page-marketing-content">
          <div
            className={cn(
              "relative overflow-hidden rounded-[var(--design-card-corner-radius-small,24px)]",
              "border border-[var(--primary-theme-200)]",
              "bg-[var(--neutral-theme-050)]",
              "shadow-[0_10px_20px_0_rgba(29,62,11,0.08)]",
            )}
          >
            <div className="relative z-10 flex flex-col p-10">
              <header className="text-left">
                <h2 className="font-hero-display text-[clamp(1.75rem,2.5vw+0.5rem,3.125rem)] font-semibold uppercase leading-[1.1] text-[var(--title-beige-color)]">
                  {optimizerContent.title}
                </h2>
                <p className="app-header-subheadline-regular text-average mt-4">
                  {optimizerContent.subtitle.body}
                  <a
                    href={optimizerContent.subtitle.linkHref}
                    className="font-bold text-[var(--primary-theme-500)] underline-offset-2 hover:underline"
                  >
                    {optimizerContent.subtitle.linkText}
                  </a>
                  .
                </p>
                <OptimizerStepPills step={step} />
                <p className="sr-only">{optimizerContent.stepLabels[step]}</p>
              </header>

              <div
                className={cn(
                  "mx-auto mt-8 min-w-0 w-full",
                  step === 2 && "max-w-3xl",
                  step === 3 && "max-w-4xl",
                )}
              >
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <OptimizerStep1
                      key="step1"
                      onPlaidConnect={onPlaidConnect}
                      plaidBusy={plaidBusy}
                      connectButtonRef={connectButtonRef}
                    />
                  )}
                  {step === 2 && (
                    <OptimizerStep2
                      key="step2"
                      accounts={accounts}
                      setAccounts={setAccounts}
                      onBack={() => {
                        setAccounts([]);
                        setStep(1);
                      }}
                      onNext={goToStep3}
                      onPlaidConnect={onPlaidConnect}
                      plaidBusy={plaidBusy}
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
