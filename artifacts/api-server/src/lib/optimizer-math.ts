const TARGET_APR_DEFAULT = 8;

function monthsToPayoff(
  balance: number,
  annualRatePct: number,
  monthlyPayment: number,
): number {
  if (balance <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (monthlyPayment <= balance * r) {
    return 600;
  }
  if (r === 0) return Math.ceil(balance / monthlyPayment);
  const n = Math.log(monthlyPayment / (monthlyPayment - balance * r)) / Math.log(1 + r);
  return Math.min(600, Math.ceil(n));
}

export function calculateAnnualSavings(
  balance: number,
  currentRate: number,
  targetRate: number = TARGET_APR_DEFAULT,
  monthlyPayment?: number | null,
): number {
  const monthlyInterestWaste = (balance * (currentRate / 100)) / 12;
  const targetMonthlyInterest = (balance * (targetRate / 100)) / 12;
  const monthlySavings = Math.max(0, monthlyInterestWaste - targetMonthlyInterest);
  return Math.round(monthlySavings * 12 * 100) / 100;
}

export function calculateOptimization(
  balance: number,
  currentRate: number,
  targetRate: number = TARGET_APR_DEFAULT,
  monthlyPayment?: number | null,
) {
  const dailyInterestWaste = (balance * (currentRate / 100)) / 365;
  const monthlyInterestWaste = (balance * (currentRate / 100)) / 12;
  const targetMonthlyInterest = (balance * (targetRate / 100)) / 12;
  const monthlySavings = Math.max(0, monthlyInterestWaste - targetMonthlyInterest);
  const annualSavings = monthlySavings * 12;

  const minPayment = Math.max(25, balance * 0.02);
  const payment = monthlyPayment ?? minPayment;

  const currentPayoffMonths = monthsToPayoff(balance, currentRate, payment);
  const newPayoffMonths = monthsToPayoff(balance, targetRate, payment);

  const newPayoffDate = new Date();
  newPayoffDate.setMonth(newPayoffDate.getMonth() + newPayoffMonths);
  const iso = newPayoffDate.toISOString().slice(0, 10);

  return {
    dailyInterestWaste: Math.round(dailyInterestWaste * 100) / 100,
    monthlyInterestWaste: Math.round(monthlyInterestWaste * 100) / 100,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    annualSavings: Math.round(annualSavings * 100) / 100,
    currentPayoffMonths,
    newPayoffMonths,
    newPayoffDate: iso,
    currentRate,
    targetRate,
  };
}

export const CABINET_TARGET_APR = TARGET_APR_DEFAULT;
