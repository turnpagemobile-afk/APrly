import { dashboardTabContent } from "@/content/dashboard-tab";
import { Button } from "@/components/ui/button";

type CreatePlanEmptyCardProps = {
  onCreateSavingPlan: () => void;
  isCreatingPlan?: boolean;
};

export function CreatePlanEmptyCard({
  onCreateSavingPlan,
  isCreatingPlan = false,
}: CreatePlanEmptyCardProps) {
  const copy = dashboardTabContent.empty;
  return (
    <div className="rounded-2xl border border-[var(--primary-theme-200)] bg-[var(--primary-theme-100)] px-6 py-12 text-center bp600:px-10 bp600:py-16">
      <p className="text-sm font-extrabold uppercase leading-snug tracking-wide text-[var(--neutral-theme-900)] bp600:text-base">
        {copy.line1}{" "}
        <span className="text-[var(--title-color)]">{copy.line2}</span> {copy.line3}
      </p>
      <Button
        type="button"
        size="lg"
        className="mt-8 w-full max-w-md bg-[var(--action-default-color)] font-bold uppercase tracking-wide hover:bg-[var(--action-hover-color)] bp600:w-auto bp600:min-w-[240px]"
        disabled={isCreatingPlan}
        onClick={onCreateSavingPlan}
      >
        {copy.cta}
      </Button>
    </div>
  );
}
