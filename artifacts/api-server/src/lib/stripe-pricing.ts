/** Sandbox price IDs from env naming; legacy STRIPE_PRICE_* still supported. */
export function stripeSubscriptionPriceId(): string | undefined {
  const v =
    process.env["STRIPE_SANDBOX_SUBSCRIPTION_PRICE_ID"]?.trim() ||
    process.env["STRIPE_PRICE_SUBSCRIPTION"]?.trim();
  return v || undefined;
}

export function stripeConfiguredForSubscriptionRenewal(): boolean {
  return Boolean(
    process.env["STRIPE_SECRET_KEY"]?.trim() && stripeSubscriptionPriceId(),
  );
}

export function frontendOrigin(): string {
  return (process.env["FRONTEND_ORIGIN"] ?? "http://localhost:5173").replace(/\/+$/, "");
}
