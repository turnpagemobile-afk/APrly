import { useMemo, type Dispatch, type SetStateAction } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PillButton } from "@/components/shared/PillButton";
import type { CardEntry } from "./types";
import { accountsAreComplete } from "./optimizerAccounts";
import { optimizerContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { sharedAsset } from "@/lib/shared-assets";
import { cn } from "@/lib/utils";

export interface OptimizerStep2Props {
  accounts: CardEntry[];
  setAccounts: Dispatch<SetStateAction<CardEntry[]>>;
  onBack: () => void;
  onNext: () => void;
  onPlaidConnect: () => void;
  plaidBusy?: boolean;
}

function formatBalance(value: string): string {
  const parsed = parseFloat(value.replace(",", "."));
  if (Number.isNaN(parsed)) return value;
  return parsed.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatRate(value: string): string {
  const parsed = parseFloat(value.replace(",", "."));
  if (Number.isNaN(parsed)) return value;
  const decimals = parsed % 1 === 0 ? 0 : 2;
  return `${parsed.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

function AuditCardSummaryRow({
  account,
  index,
  canRemove,
  onRemove,
}: {
  account: CardEntry;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}) {
  return (
    <article
      className={cn(
        "flex gap-3 rounded-[var(--design-card-corner-radius-small,24px)] bg-[var(--card-1lvl-bg-color)] p-4 shadow-[var(--cabinet-card-shadow)]",
        "bp600:items-start bp600:p-5",
      )}
    >
      <img
        src={landingAsset("landing/audit/credit-card.svg")}
        alt=""
        aria-hidden
        className="h-11 w-11 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="app-text-p1-bold text-average">
            {account.brand || `Card ${index + 1}`}
          </h3>
          {canRemove ? (
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--primary-theme-100)]"
              onClick={onRemove}
              aria-label={`Remove ${account.brand || `card ${index + 1}`}`}
            >
              <img
                src={sharedAsset("trash.svg")}
                alt=""
                aria-hidden
                className="h-5 w-5"
              />
            </button>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-3 flex flex-col gap-2",
            "bp600:mt-4 bp600:flex-row bp600:flex-wrap bp600:gap-3",
          )}
        >
          <span className="inline-flex w-fit items-center rounded-full bg-[var(--info-theme-200)] px-3 py-1.5">
            <span className="app-text-p1-regular text-average">Balance:</span>
            <span className="app-text-p1-bold text-average ml-1">
              ${formatBalance(account.balance)}
            </span>
          </span>
          <span className="inline-flex w-fit items-center rounded-full bg-[var(--accent-theme-200)] px-3 py-1.5">
            <span className="app-text-p1-regular text-average">Rate:</span>
            <span className="app-text-p1-bold text-average ml-1">
              {formatRate(account.rate)}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

export function OptimizerStep2({
  accounts,
  setAccounts,
  onBack,
  onNext,
  onPlaidConnect,
  plaidBusy = false,
}: OptimizerStep2Props) {
  const copy = optimizerContent.step2;

  const remove = (index: number) => {
    setAccounts((prev) => prev.filter((_, i) => i !== index));
  };

  const cardsReady = useMemo(() => accountsAreComplete(accounts), [accounts]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 bp600:space-y-8"
    >
      <div className="space-y-4">
        {accounts.map((account, index) => (
          <AuditCardSummaryRow
            key={account.accountId ?? `audit-card-${index}`}
            account={account}
            index={index}
            canRemove={accounts.length > 1}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 bp600:items-center bp600:gap-4">
        <div className="mx-auto flex w-full flex-col gap-3 bp600:max-w-[360px] bp600:gap-4">
          <PillButton
            type="button"
            variant="primary"
            size="lg"
            disabled={plaidBusy}
            onClick={onPlaidConnect}
            className="w-full"
          >
            {plaidBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {copy.connectMorePlaid}
          </PillButton>

          <div className="grid grid-cols-2 gap-3">
            <PillButton
              type="button"
              variant="secondary"
              size="lg"
              onClick={onBack}
              className="w-full min-w-0"
            >
              {copy.back}
            </PillButton>
            <PillButton
              type="button"
              variant="primary"
              size="lg"
              onClick={onNext}
              disabled={!cardsReady}
              className="w-full min-w-0"
            >
              {copy.continue}
            </PillButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
