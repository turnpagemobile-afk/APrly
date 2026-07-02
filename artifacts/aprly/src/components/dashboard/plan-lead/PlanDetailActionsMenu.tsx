import { useState } from "react";
import { Trash2 } from "lucide-react";
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
              src={cabinetAsset("cabinet/dashboard/button-general.svg")}
              alt=""
              aria-hidden
              className="h-11 w-11"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className={cn(
            "min-w-[12rem] rounded-[var(--design-card-corner-radius-small,24px)]",
            "border border-[var(--neutral-theme-200)] bg-white p-2 shadow-lg",
          )}
        >
          <DropdownMenuItem
            className={cn(
              "cursor-pointer gap-2 rounded-[12px] py-3",
              "app-button-button-s text-[var(--danger-theme-500)]",
              "focus:bg-[var(--danger-theme-100)] focus:text-[var(--danger-theme-500)]",
            )}
            onSelect={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
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
