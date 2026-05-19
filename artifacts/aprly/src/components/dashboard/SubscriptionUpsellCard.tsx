import { Check } from "lucide-react";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubscriptionUpsellCardProps = {
  onActivate: () => void;
  isLoading?: boolean;
};

export function SubscriptionUpsellCard({
  onActivate,
  isLoading = false,
}: SubscriptionUpsellCardProps) {
  return (
    <div className={cn("rounded-2xl border border-primary/30 bg-[var(--info-theme-100)]/40 p-6")}>
      <h2 className="text-center text-lg font-extrabold tracking-tight text-foreground">
        {dashboardTabContent.upsell.title}
      </h2>
      <ul className="mt-5 space-y-2.5">
        {dashboardTabContent.upsell.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-foreground/90">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        type="button"
        size="lg"
        className="mt-6 w-full font-semibold"
        onClick={onActivate}
        disabled={isLoading}
      >
        {isLoading
          ? dashboardTabContent.checkout.activating
          : dashboardTabContent.upsell.cta}
      </Button>
    </div>
  );
}
