import { useState } from "react";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { ApiError } from "@workspace/api-client-react/custom-fetch";
import { usePatchMePassword } from "@workspace/api-client-react";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  hasError: boolean;
  errorMessage?: string;
  autoComplete: string;
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  hasError,
  errorMessage,
  autoComplete,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="dash-account-field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={128}
          className={cn("dash-account-input pr-10", hasError && "dash-account-input--error")}
          aria-invalid={hasError}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--action-default-color)]"
          onClick={onToggleShow}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {errorMessage ? <p className="dash-account-field-error">{errorMessage}</p> : null}
    </div>
  );
}

export function AccountPasswordCard() {
  const patchPassword = usePatchMePassword();
  const copy = dashboardProfileContent.password;
  const fieldRequired = dashboardProfileContent.fieldRequired;
  const passwordSchema = buildPasswordSchema(copy);

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
        <PasswordField
          id="account-old-password"
          label={copy.oldPassword}
          value={oldPassword}
          onChange={setOldPassword}
          show={showOld}
          onToggleShow={() => setShowOld((v) => !v)}
          hasError={Boolean(oldError) || (submitAttempted && !oldPassword && !oldError)}
          errorMessage={
            oldError ??
            (submitAttempted && !oldPassword ? fieldRequired : undefined)
          }
          autoComplete="current-password"
        />

        <PasswordField
          id="account-new-password"
          label={copy.newPassword}
          value={password}
          onChange={setPassword}
          show={showNew}
          onToggleShow={() => setShowNew((v) => !v)}
          hasError={Boolean(newError) || (submitAttempted && !password && !newError)}
          errorMessage={
            newError ?? (submitAttempted && !password ? fieldRequired : undefined)
          }
          autoComplete="new-password"
        />

        <PasswordField
          id="account-confirm-password"
          label={copy.confirmPassword}
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          onToggleShow={() => setShowConfirm((v) => !v)}
          hasError={
            Boolean(confirmError) || (submitAttempted && !confirmPassword && !confirmError)
          }
          errorMessage={
            confirmError ??
            (submitAttempted && !confirmPassword ? fieldRequired : undefined)
          }
          autoComplete="new-password"
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
