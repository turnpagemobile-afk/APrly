import { dashboardTabContent } from "@/content/dashboard-tab";
import { PillButton } from "@/components/shared/PillButton";

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
    <div
      className="mx-auto flex w-full max-w-[580px] flex-col gap-5 rounded-[var(--design-card-corner-radius-small,24px)] bg-[var(--card-1lvl-bg-color)] p-5"
      style={{ boxShadow: "var(--cabinet-card-shadow)" }}
    >
      <div className="rounded-[12px] bg-[var(--primary-theme-100)] px-4 py-5 text-center">
        <p className="app-header-screen-title-bold text-title leading-snug">
          {copy.line1}{" "}
          <span className="text-action">{copy.line2}</span> {copy.line3}
        </p>
      </div>
      <div className="flex justify-center">
        <PillButton
          type="button"
          variant="primary"
          size="default"
          className="h-[52px] w-[244px] max-w-full"
          disabled={isCreatingPlan}
          onClick={onCreateSavingPlan}
        >
          {copy.cta}
        </PillButton>
      </div>
    </div>
  );
}
