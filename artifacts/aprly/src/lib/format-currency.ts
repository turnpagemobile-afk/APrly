export function formatCurrency(value: number, maximumFractionDigits = 0): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  });
}

/** Figma dashboard amounts: `$ 40 930` (summary) or `$12 480.55` (card rows). */
export function formatDashboardCurrency(
  value: number,
  maximumFractionDigits = 0,
  options?: { spaceAfterDollar?: boolean },
): string {
  const spaceAfterDollar =
    options?.spaceAfterDollar ?? maximumFractionDigits === 0;
  const abs = Math.abs(value);
  const fixed = abs.toFixed(maximumFractionDigits);
  const [intPart, decPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const amount =
    maximumFractionDigits > 0 && decPart
      ? `${grouped}.${decPart}`
      : grouped;
  const prefix = spaceAfterDollar ? "$ " : "$";
  const sign = value < 0 ? "-" : "";
  return `${sign}${prefix}${amount}`;
}
