import type { Dispatch, SetStateAction } from "react";
import { Trash2 } from "lucide-react";
import type { CardEntry } from "@/components/landing/types";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { createPlanContent } from "@/content/create-plan";

type CreateSavingPlanCardListProps = {
  accounts: CardEntry[];
  setAccounts: Dispatch<SetStateAction<CardEntry[]>>;
};

export function CreateSavingPlanCardList({
  accounts,
  setAccounts,
}: CreateSavingPlanCardListProps) {
  const update = (index: number, patch: Partial<CardEntry>) => {
    setAccounts((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  };

  const remove = (index: number) => {
    setAccounts((prev) => prev.filter((_, i) => i !== index));
  };

  if (!accounts.length) return null;

  return (
    <div className="dash-create-plan-stack">
      {accounts.map((account, index) => (
        <article
          key={account.accountId ?? `create-plan-card-${index}`}
          className="dash-create-plan-card"
        >
          <div className="dash-create-plan-card-header">
            <div className="dash-create-plan-card-heading">
              <span className="dash-create-plan-card-icon" aria-hidden="true">
                <img
                  src={cabinetAsset("cabinet/dashboard/card-label-icon.svg")}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              </span>
              <h2 className="dash-create-plan-card-title">
                {createPlanContent.cardTitle(index + 1)}
              </h2>
            </div>
            {accounts.length > 1 ? (
              <button
                type="button"
                className="dash-create-plan-remove-btn"
                onClick={() => remove(index)}
                aria-label={createPlanContent.removeCardAria(index + 1)}
              >
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor={`create-plan-name-${index}`}
                className="dash-create-plan-field-label"
              >
                {createPlanContent.cardNameLabel}
              </label>
              <input
                id={`create-plan-name-${index}`}
                type="text"
                className="dash-create-plan-input"
                placeholder={createPlanContent.cardNamePlaceholder}
                value={account.brand}
                onChange={(e) => update(index, { brand: e.target.value })}
                autoComplete="off"
              />
            </div>

            <div className="dash-create-plan-fields-row">
              <div>
                <label
                  htmlFor={`create-plan-balance-${index}`}
                  className="dash-create-plan-field-label"
                >
                  {createPlanContent.balanceLabel}
                </label>
                <div className="dash-create-plan-input-adorned dash-create-plan-input-adorned--prefix">
                  <span className="dash-create-plan-input-affix dash-create-plan-input-affix--prefix">
                    $
                  </span>
                  <input
                    id={`create-plan-balance-${index}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    className="dash-create-plan-input"
                    placeholder={createPlanContent.balancePlaceholder}
                    value={account.balance}
                    onChange={(e) => update(index, { balance: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`create-plan-rate-${index}`}
                  className="dash-create-plan-field-label"
                >
                  {createPlanContent.rateLabel}
                </label>
                <div className="dash-create-plan-input-adorned dash-create-plan-input-adorned--suffix">
                  <input
                    id={`create-plan-rate-${index}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    className="dash-create-plan-input"
                    placeholder={createPlanContent.ratePlaceholder}
                    value={account.rate}
                    onChange={(e) => update(index, { rate: e.target.value })}
                  />
                  <span className="dash-create-plan-input-affix dash-create-plan-input-affix--suffix">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
