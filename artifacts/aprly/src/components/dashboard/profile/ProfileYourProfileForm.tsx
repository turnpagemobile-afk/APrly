import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  getGetMeQueryKey,
  useDeleteMe,
  usePatchMe,
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-session";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ProfileYourProfileForm() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const patchMe = usePatchMe();
  const deleteMe = useDeleteMe();
  const copy = dashboardProfileContent.profileCard;
  const deleteCopy = dashboardProfileContent.deleteAccount;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patchMe.mutateAsync({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast(dashboardProfileContent.toast.profileSaved);
    } catch {
      toast({
        ...dashboardProfileContent.toast.profileError,
        variant: "destructive",
      });
    }
  };

  const onDelete = async () => {
    try {
      await deleteMe.mutateAsync();
      setDeleteOpen(false);
      queryClient.clear();
      navigate("/");
    } catch {
      toast({
        ...dashboardProfileContent.toast.deleteError,
        variant: "destructive",
      });
    }
  };

  const email = user?.email ?? "";

  return (
    <form onSubmit={(e) => void onSave(e)} className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">{copy.title}</h2>

      <div className="space-y-2">
        <Label htmlFor="profile-first-name">{copy.firstName}</Label>
        <Input
          id="profile-first-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          required
          maxLength={120}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-last-name">{copy.lastName}</Label>
        <Input
          id="profile-last-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
          required
          maxLength={120}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-email">{copy.email}</Label>
        <Input
          id="profile-email"
          type="email"
          value={email}
          disabled
          autoComplete="email"
          className="disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>

      <div className="flex flex-col gap-3 cabinet:flex-row cabinet:justify-between">
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" className="w-full cabinet:w-auto">
              {copy.delete}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteCopy.title}</AlertDialogTitle>
              <AlertDialogDescription>{deleteCopy.message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{deleteCopy.cancel}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMe.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  void onDelete();
                }}
              >
                {deleteMe.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  deleteCopy.confirm
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          type="submit"
          className="w-full cabinet:w-auto cabinet:min-w-[10rem]"
          disabled={patchMe.isPending}
        >
          {patchMe.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            copy.save
          )}
        </Button>
      </div>
    </form>
  );
}
