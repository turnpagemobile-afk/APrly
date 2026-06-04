import { useAuth } from "@/lib/auth-session";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { AccountConfirmDialog } from "@/components/dashboard/account/AccountConfirmDialog";

type LogoutConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LogoutConfirmDialog({ open, onOpenChange }: LogoutConfirmDialogProps) {
  const { logout } = useAuth();
  const copy = dashboardProfileContent.logout;

  const onConfirm = async () => {
    onOpenChange(false);
    await logout();
  };

  return (
    <AccountConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={copy.title}
      message={copy.message}
      confirmLabel={copy.confirm}
      onConfirm={onConfirm}
    />
  );
}
