import { Plus } from "lucide-react";
import { PillButton } from "@/components/shared/PillButton";
import { cabinetShellContent } from "@/content/dashboard-home";
import { cn } from "@/lib/utils";

type CabinetHeaderActionsProps = {
  variant: "desktop" | "compact";
  isOffline: boolean;
  onCreateSavingPlan: () => void;
  isCreatingPlan?: boolean;
};

export function CabinetHeaderActions({
  variant,
  isOffline,
  onCreateSavingPlan,
  isCreatingPlan = false,
}: CabinetHeaderActionsProps) {
  const fullButton = (
    <PillButton
      type="button"
      variant="secondary"
      size="default"
      className={cn(
        "h-[52px] w-[244px] max-w-full shrink-0",
        variant === "desktop" ? "inline-flex" : "hidden bp600:inline-flex",
      )}
      disabled={isOffline || isCreatingPlan}
      onClick={onCreateSavingPlan}
    >
      {cabinetShellContent.createSavingPlan}
    </PillButton>
  );

  const plusButton =
    variant === "compact" ? (
      <PillButton
        type="button"
        variant="secondary"
        size="sm"
        className="h-11 w-11 shrink-0 px-0 bp600:hidden"
        disabled={isOffline || isCreatingPlan}
        onClick={onCreateSavingPlan}
        aria-label={cabinetShellContent.createSavingPlan}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </PillButton>
    ) : null;

  return (
    <>
      {fullButton}
      {plusButton}
    </>
  );
}
