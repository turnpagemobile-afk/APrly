import { Link } from "wouter";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { createPlanHref } from "@/lib/create-plan-navigation";
import { Button } from "@/components/ui/button";

export function CreatePlanEmptyCard() {
  const copy = dashboardTabContent.empty;
  return (
    <div className="rounded-2xl bg-[var(--info-theme-100)] px-6 py-12 text-center bp600:px-10 bp600:py-16">
      <p className="text-sm font-extrabold uppercase leading-snug tracking-wide text-[var(--neutral-theme-900)] bp600:text-base">
        {copy.line1}{" "}
        <span className="text-primary">{copy.line2}</span> {copy.line3}
      </p>
      <Button
        type="button"
        size="lg"
        className="mt-8 w-full max-w-md font-bold uppercase tracking-wide bp600:w-auto bp600:min-w-[240px]"
        asChild
      >
        <Link href={createPlanHref("/dashboard?tab=dashboard")}>{copy.cta}</Link>
      </Button>
    </div>
  );
}
