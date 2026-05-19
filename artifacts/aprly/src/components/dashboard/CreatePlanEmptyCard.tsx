import { Link } from "wouter";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { createPlanHref } from "@/lib/create-plan-navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CreatePlanEmptyCard() {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card p-6 text-center")}>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {dashboardTabContent.empty.body}
      </p>
      <Button type="button" size="lg" className="mt-6 w-full font-semibold" asChild>
        <Link href={createPlanHref("/dashboard?tab=dashboard")}>
          {dashboardTabContent.empty.cta}
        </Link>
      </Button>
    </div>
  );
}
