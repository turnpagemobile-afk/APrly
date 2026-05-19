const TARGET_APR_PERCENT = 8;
const MIN_PAYMENT_RATE = 0.02;

export type MeltCountdownResult = {
  label: string;
  totalMonths: number;
};

/**
 * Approximate debt-free timeline at target APR with minimum payments (2% of balance / month).
 */
export function formatMeltCountdown(totalDebt: number): MeltCountdownResult {
  if (!Number.isFinite(totalDebt) || totalDebt <= 0) {
    return { label: "—", totalMonths: 0 };
  }

  let balance = totalDebt;
  let months = 0;
  const maxMonths = 600;

  while (balance > 1 && months < maxMonths) {
    const monthlyRate = TARGET_APR_PERCENT / 100 / 12;
    const interest = balance * monthlyRate;
    const payment = Math.max(balance * MIN_PAYMENT_RATE, 25);
    balance = balance + interest - payment;
    months += 1;
  }

  if (months >= maxMonths) {
    return { label: "50+ years", totalMonths: months };
  }

  const years = Math.floor(months / 12);
  const rem = months % 12;

  if (years === 0) {
    return { label: `${rem} month${rem === 1 ? "" : "s"}`, totalMonths: months };
  }
  if (rem === 0) {
    return { label: `${years} year${years === 1 ? "" : "s"}`, totalMonths: months };
  }

  return {
    label: `${years} year${years === 1 ? "" : "s"} ${rem} month${rem === 1 ? "" : "s"}`,
    totalMonths: months,
  };
}
