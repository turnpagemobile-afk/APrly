import { useAuth } from "@/lib/auth-session";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-page-narrow max-w-sm gap-0 p-0 sm:max-w-sm">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="text-xl font-bold">{copy.title}</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-8 text-center">
          <p className="text-base font-medium text-foreground">{copy.message}</p>
          <Button
            type="button"
            className="mt-8 w-full max-w-xs font-semibold"
            onClick={() => void onConfirm()}
          >
            {copy.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
