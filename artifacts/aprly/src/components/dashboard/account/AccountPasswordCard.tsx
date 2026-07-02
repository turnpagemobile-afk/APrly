import { useState } from "react";
import { z } from "zod";
import { ApiError } from "@workspace/api-client-react/custom-fetch";
import { usePatchMePassword } from "@workspace/api-client-react";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { toast } from "@/hooks/use-toast";
import { AuthPasswordInput } from "@/components/shared/auth-form/AuthPasswordInput";
import { AccountSubmitButton, AccountSuccessView } from "@/components/dashboard/account/AccountShared";

function buildPasswordSchema(copy: typeof dashboardProfileContent.password) {
  const required = dashboardProfileContent.fieldRequired;
  return z
    .object({
      currentPassword: z.string().min(1, required),
      password: z.string().min(1, required).min(8, copy.passwordLength).max(20, copy.passwordLength),
      confirmPassword: z
        .string()
        .min(1, required)
        .min(8, copy.passwordLength)
        .max(20, copy.passwordLength),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: copy.passwordsMustMatch,
      path: ["confirmPassword"],
    });
}

export function AccountPasswordCard() {
  const patchPassword = usePatchMePassword();
  const copy = dashboardProfileContent.password;
  const fieldRequired = dashboardProfileContent.fieldRequired;
  const passwordSchema = buildPasswordSchema(copy);

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const oldError = fieldErrors.currentPassword;
  const newError = fieldErrors.password;
  const confirmError = fieldErrors.confirmPassword;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setShowBanner(false);
    setFieldErrors({});

    const parsed = passwordSchema.safeParse({
      currentPassword: oldPassword,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      setShowBanner(true);
      return;
    }

    try {
      await patchPassword.mutateAsync({
        data: {
          currentPassword: parsed.data.currentPassword,
          password: parsed.data.password,
          confirmPassword: parsed.data.confirmPassword,
        },
      });
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
      setSubmitAttempted(false);
      setShowSuccess(true);
      toast(dashboardProfileContent.toast.passwordSaved);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 400) {
        const body = err.data as { fieldErrors?: Record<string, string[]> } | undefined;
        if (body?.fieldErrors) {
          const next: Record<string, string> = {};
          for (const [key, messages] of Object.entries(body.fieldErrors)) {
            if (!messages[0]) continue;
            next[key] =
              key === "currentPassword" ? copy.currentPasswordIncorrect : messages[0];
          }
          setFieldErrors(next);
          setShowBanner(true);
          return;
        }
      }
      setShowBanner(true);
      toast({
        ...dashboardProfileContent.toast.passwordError,
        variant: "destructive",
      });
    }
  };

  if (showSuccess) {
    return (
      <section className="dash-account-card">
        <h2 className="dash-account-section-title">{copy.title}</h2>
        <AccountSuccessView
          message={copy.successMessage}
          onOk={() => setShowSuccess(false)}
        />
      </section>
    );
  }

  return (
    <section className="dash-account-card">
      <h2 className="dash-account-section-title">{copy.title}</h2>
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <AuthPasswordInput
          id="account-old-password"
          label={copy.oldPassword}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          autoComplete="current-password"
          maxLength={128}
          error={
            oldError ?? (submitAttempted && !oldPassword ? fieldRequired : null)
          }
        />

        <AuthPasswordInput
          id="account-new-password"
          label={copy.newPassword}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          maxLength={128}
          error={
            newError ?? (submitAttempted && !password ? fieldRequired : null)
          }
        />

        <AuthPasswordInput
          id="account-confirm-password"
          label={copy.confirmPassword}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          maxLength={128}
          error={
            confirmError ??
            (submitAttempted && !confirmPassword ? fieldRequired : null)
          }
        />

        {showBanner ? (
          <div role="alert" className="dash-account-error-banner">
            {copy.errorBanner}
          </div>
        ) : null}

        <AccountSubmitButton label={copy.apply} pending={patchPassword.isPending} />
      </form>
    </section>
  );
}
