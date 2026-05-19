import { dashboardPromoContent } from "@/content/dashboard-home";
import { Button } from "@/components/ui/button";

type DashboardPromoCardProps = {
  subscriptionActive: boolean;
};

export function DashboardPromoCard({ subscriptionActive }: DashboardPromoCardProps) {
  const storeComingSoon = true;
  const disabled = !subscriptionActive || storeComingSoon;

  const disabledTitle = !subscriptionActive
    ? dashboardPromoContent.disabledNoSubscription
    : storeComingSoon
      ? dashboardPromoContent.disabledComingSoon
      : undefined;

  return (
    <section className="px-4 pt-6">
      <div className="rounded-2xl border border-primary/30 bg-[var(--info-theme-100)]/40 p-6 text-center">
        <h2 className="text-lg font-extrabold tracking-tight text-foreground">
          {dashboardPromoContent.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">
          {dashboardPromoContent.body}
        </p>
        <Button
          type="button"
          size="lg"
          className="mt-6 w-full font-semibold cabinet:max-w-xs"
          disabled={disabled}
          title={disabledTitle}
        >
          {dashboardPromoContent.cta.label}
        </Button>
      </div>
    </section>
  );
}
