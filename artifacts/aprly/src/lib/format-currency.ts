export function formatCurrency(value: number, maximumFractionDigits = 0): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  });
}
