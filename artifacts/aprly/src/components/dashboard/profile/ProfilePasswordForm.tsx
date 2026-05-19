import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { ApiError } from "@workspace/api-client-react/custom-fetch";
import { usePatchMePassword } from "@workspace/api-client-react";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const passwordSchema = z
  .object({
    password: z.string().min(8).max(20),
    confirmPassword: z.string().min(8).max(20),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export function ProfilePasswordForm() {
  const patchPassword = usePatchMePassword();
  const copy = dashboardProfileContent.passwordCard;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = passwordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    try {
      await patchPassword.mutateAsync({
        data: {
          password: parsed.data.password,
          confirmPassword: parsed.data.confirmPassword,
        },
      });
      setPassword("");
      setConfirmPassword("");
      toast(dashboardProfileContent.toast.passwordSaved);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 400) {
        const body = err.data as { fieldErrors?: Record<string, string[]> } | undefined;
        if (body?.fieldErrors) {
          const next: Record<string, string> = {};
          for (const [key, messages] of Object.entries(body.fieldErrors)) {
            if (messages[0]) next[key] = messages[0];
          }
          setFieldErrors(next);
          return;
        }
      }
      toast({
        ...dashboardProfileContent.toast.passwordError,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">{copy.title}</h2>
      <p className="text-sm text-muted-foreground">{copy.hint}</p>

      <div className="space-y-2">
        <Label htmlFor="profile-new-password">{copy.newPassword}</Label>
        <Input
          id="profile-new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          maxLength={20}
          aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password ? (
          <p className="text-sm text-destructive">{fieldErrors.password}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-verify-password">{copy.verifyPassword}</Label>
        <Input
          id="profile-verify-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          maxLength={20}
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
        />
        {fieldErrors.confirmPassword ? (
          <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={patchPassword.isPending}>
        {patchPassword.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          copy.apply
        )}
      </Button>
    </form>
  );
}
