const TARGET_APR_PERCENT = 8;
const MIN_PAYMENT_RATE = 0.02;

export type MeltCountdownDisplay =
  | { kind: "empty" }
  | { kind: "yearsMonths"; years: number; months: number }
  | { kind: "yearsOnly"; years: number }
  | { kind: "monthsOnly"; months: number }
  | { kind: "cap"; years: number }
  | { kind: "fallback"; text: string };

export type MeltCountdownResult = {
  display: MeltCountdownDisplay;
  label: string;
  totalMonths: number;
};

function pluralUnit(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function formatMeltCountdownLabel(display: MeltCountdownDisplay): string {
  switch (display.kind) {
    case "empty":
      return "—";
    case "yearsMonths":
      return `${display.years} ${pluralUnit(display.years, "year", "years")} ${display.months} ${pluralUnit(display.months, "month", "months")}`;
    case "yearsOnly":
      return `${display.years} ${pluralUnit(display.years, "year", "years")}`;
    case "monthsOnly":
      return `${display.months} ${pluralUnit(display.months, "month", "months")}`;
    case "cap":
      return `${display.years}+ ${pluralUnit(display.years, "year", "years")}`;
    case "fallback":
      return display.text;
  }
}

/**
 * Approximate debt-free timeline at target APR with minimum payments (2% of balance / month).
 */
export function formatMeltCountdown(totalDebt: number): MeltCountdownResult {
  if (!Number.isFinite(totalDebt) || totalDebt <= 0) {
    const display: MeltCountdownDisplay = { kind: "empty" };
    return { display, label: formatMeltCountdownLabel(display), totalMonths: 0 };
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
    const display: MeltCountdownDisplay = { kind: "cap", years: 50 };
    return { display, label: formatMeltCountdownLabel(display), totalMonths: months };
  }

  const years = Math.floor(months / 12);
  const rem = months % 12;

  let display: MeltCountdownDisplay;
  if (years === 0) {
    display = { kind: "monthsOnly", months: rem };
  } else if (rem === 0) {
    display = { kind: "yearsOnly", years };
  } else {
    display = { kind: "yearsMonths", years, months: rem };
  }

  return {
    display,
    label: formatMeltCountdownLabel(display),
    totalMonths: months,
  };
}
