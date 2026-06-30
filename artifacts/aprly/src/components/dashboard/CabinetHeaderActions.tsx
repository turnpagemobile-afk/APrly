import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const fullButtonClass = cn(
    "border-[var(--action-default-color)] font-bold uppercase tracking-wide text-action hover:bg-[var(--primary-theme-100)]",
    variant === "desktop" ? "inline-flex" : "hidden bp600:inline-flex",
  );

  const fullButton = (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={fullButtonClass}
      disabled={isOffline || isCreatingPlan}
      onClick={onCreateSavingPlan}
    >
      {cabinetShellContent.createSavingPlan}
    </Button>
  );

  const plusButton =
    variant === "compact" ? (
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-10 w-10 shrink-0 rounded-xl border-[var(--action-default-color)] text-action hover:bg-[var(--primary-theme-100)] bp600:hidden"
        disabled={isOffline || isCreatingPlan}
        onClick={onCreateSavingPlan}
        aria-label={cabinetShellContent.createSavingPlan}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </Button>
    ) : null;

  return (
    <>
      {fullButton}
      {plusButton}
    </>
  );
}
