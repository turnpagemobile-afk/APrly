import { useState } from "react";
import { LogOut, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { toast } from "@/hooks/use-toast";
import { AccountConfirmDialog } from "@/components/dashboard/account/AccountConfirmDialog";
import { LogoutConfirmDialog } from "@/components/dashboard/LogoutConfirmDialog";

export function AccountActionsRow() {
  const [, navigate] = useLocation();
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
      navigate("/");
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
        <button
          type="button"
          className="dash-account-logout-btn"
          onClick={() => setLogoutOpen(true)}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          {copy.actions.logOut}
        </button>

        <button type="button" className="dash-account-delete-btn" onClick={() => setDeleteOpen(true)}>
          <XCircle className="h-5 w-5 shrink-0" aria-hidden />
          {deleteCopy.button}
        </button>
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
