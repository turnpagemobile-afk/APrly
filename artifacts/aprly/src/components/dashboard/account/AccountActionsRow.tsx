import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteMe } from "@workspace/api-client-react";
import { goToLanding } from "@/lib/app-navigation";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { toast } from "@/hooks/use-toast";
import { AccountConfirmDialog } from "@/components/dashboard/account/AccountConfirmDialog";
import { LogoutConfirmDialog } from "@/components/dashboard/LogoutConfirmDialog";
import { PillButton } from "@/components/shared/PillButton";
import { cabinetAsset } from "@/lib/cabinet-assets";

export function AccountActionsRow() {
  const queryClient = useQueryClient();
  const deleteMe = useDeleteMe();
  const copy = dashboardProfileContent;
  const deleteCopy = copy.deleteAccount;

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const onDelete = async () => {
    try {
      await deleteMe.mutateAsync();
      setDeleteOpen(false);
      queryClient.clear();
      goToLanding("/");
    } catch {
      toast({
        ...copy.toast.deleteError,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="dash-account-actions pt-2">
        <PillButton
          type="button"
          variant="destructiveSecondary"
          size="default"
          className="h-[52px] w-[171px] max-w-full gap-2"
          onClick={() => setLogoutOpen(true)}
        >
          <img
            src={cabinetAsset("cabinet/account/logout.svg")}
            alt=""
            aria-hidden
            className="h-6 w-6 shrink-0"
          />
          {copy.actions.logOut}
        </PillButton>

        <PillButton
          type="button"
          variant="destructive"
          size="default"
          className="h-[52px] w-[245px] max-w-full gap-2"
          onClick={() => setDeleteOpen(true)}
        >
          <img
            src={cabinetAsset("cabinet/account/close-red.svg")}
            alt=""
            aria-hidden
            className="h-6 w-6 shrink-0"
          />
          {deleteCopy.button}
        </PillButton>
      </div>

      <LogoutConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} />

      <AccountConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={deleteCopy.title}
        message={deleteCopy.message}
        confirmLabel={deleteCopy.confirm}
        onConfirm={onDelete}
        isPending={deleteMe.isPending}
      />
    </>
  );
}
