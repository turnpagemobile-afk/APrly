import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountConfirmDialog } from "@/components/dashboard/account/AccountConfirmDialog";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { cn } from "@/lib/utils";

type PlanDetailActionsMenuProps = {
  onDeletePlan: () => void | Promise<void>;
  isDeletingPlan?: boolean;
};

export function PlanDetailActionsMenu({
  onDeletePlan,
  isDeletingPlan = false,
}: PlanDetailActionsMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const copy = planLeadDetailContent;

  const onConfirmDelete = async () => {
    if (isDeletingPlan) return;
    await onDeletePlan();
    setConfirmOpen(false);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="dash-plan-detail-actions-trigger"
            aria-label={copy.planActionsAriaLabel}
          >
            <img
              src={cabinetAsset("cabinet/dashboard/three-dots.svg")}
              alt=""
              aria-hidden
              className="h-6 w-6 shrink-0"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className={cn(
            "min-h-16 w-[187px] rounded-[var(--design-card-corner-radius-small,24px)]",
            "border-0 bg-[var(--card-1lvl-bg-color)] p-2",
          )}
          style={{ boxShadow: "var(--cabinet-card-shadow)" }}
        >
          <DropdownMenuItem
            className={cn(
              "cursor-pointer gap-2 rounded-[12px] py-3",
              "app-button-button-l-m text-[var(--palette-functional-danger-danger-500)]",
              "focus:bg-[var(--danger-theme-100)] focus:text-[var(--palette-functional-danger-danger-500)]",
            )}
            onSelect={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <img
              src={cabinetAsset("cabinet/dashboard/trash.svg")}
              alt=""
              aria-hidden
              className="h-6 w-6 shrink-0"
            />
            {copy.deletePlan}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={copy.deletePlanConfirmTitle}
        message={copy.deletePlanConfirmMessage}
        confirmLabel={copy.deletePlanConfirm}
        cancelLabel={copy.cancel}
        onConfirm={onConfirmDelete}
        isPending={isDeletingPlan}
      />
    </>
  );
}
