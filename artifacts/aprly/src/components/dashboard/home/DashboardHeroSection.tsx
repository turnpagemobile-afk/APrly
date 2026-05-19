import { Link } from "wouter";
import { dashboardHeroContent } from "@/content/dashboard-home";
import { createPlanHref } from "@/lib/create-plan-navigation";
import { Button } from "@/components/ui/button";

type DashboardHeroSectionProps = {
  subscriptionActive: boolean;
};

export function DashboardHeroSection({ subscriptionActive }: DashboardHeroSectionProps) {
  return (
    <section className="px-4 py-10 text-center">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
        {dashboardHeroContent.line1}
        <span className="mt-1 block text-primary">{dashboardHeroContent.line2Accent}</span>
      </h1>
      <p className="mx-auto mt-6 max-w-sm text-sm font-medium leading-relaxed text-foreground/90">
        {dashboardHeroContent.subtitle}
      </p>
      {subscriptionActive ? (
        <Button
          type="button"
          size="lg"
          className="mt-8 w-full min-w-0 font-semibold cabinet:w-auto cabinet:min-w-[10rem]"
          asChild
        >
          <Link href={createPlanHref("/dashboard")}>{dashboardHeroContent.cta.label}</Link>
        </Button>
      ) : (
        <Button
          type="button"
          size="lg"
          className="mt-8 w-full min-w-0 font-semibold cabinet:w-auto cabinet:min-w-[10rem]"
          disabled
          title={dashboardHeroContent.disabledNoSubscription}
        >
          {dashboardHeroContent.cta.label}
        </Button>
      )}
    </section>
  );
}
