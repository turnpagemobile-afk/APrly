import { Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cabinetShellContent } from "@/content/dashboard-home";
import { cn } from "@/lib/utils";

type CabinetHeaderActionsProps = {
  variant: "desktop" | "compact";
  isOffline: boolean;
  createPlanTarget: string;
};

export function CabinetHeaderActions({
  variant,
  isOffline,
  createPlanTarget,
}: CabinetHeaderActionsProps) {
  const fullButtonClass = cn(
    "border-primary font-bold uppercase tracking-wide text-primary",
    variant === "desktop" ? "inline-flex" : "hidden bp600:inline-flex",
  );

  const fullButton = (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={fullButtonClass}
      disabled={isOffline}
      asChild
    >
      <Link href={createPlanTarget}>{cabinetShellContent.createSavingPlan}</Link>
    </Button>
  );

  const plusButton =
    variant === "compact" ? (
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-10 w-10 shrink-0 rounded-xl border-primary text-primary bp600:hidden"
        disabled={isOffline}
        asChild
      >
        <Link href={createPlanTarget} aria-label={cabinetShellContent.createSavingPlan}>
          <Plus className="h-5 w-5" aria-hidden="true" />
        </Link>
      </Button>
    ) : null;

  return (
    <>
      {fullButton}
      {plusButton}
    </>
  );
}
