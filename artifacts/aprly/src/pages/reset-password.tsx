import { useMemo, useState } from "react";
import { Link } from "wouter";
import { z } from "zod";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@workspace/api-client-react/custom-fetch";
import { useResetPassword } from "@workspace/api-client-react";
import { AuthBrandLogo } from "@/components/auth/AuthBrandLogo";
import { AuthOverlayShell } from "@/components/auth/AuthOverlayShell";
import { PillButton } from "@/components/shared/PillButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authContent } from "@/content/landing";
import { syncAuthSession } from "@/lib/auth-session";
import { goToCabinet } from "@/lib/app-navigation";
import { useNavigateBack } from "@/lib/navigate-back";
import { cn } from "@/lib/utils";

type Step = "form" | "success" | "invalid";

function readResetToken(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("token")?.trim() || null;
}

function buildPasswordSchema(copy: typeof authContent.resetPassword) {
  return z
    .object({
      password: z
        .string()
        .min(1, copy.errors.fieldRequired)
        .min(8, copy.errors.passwordLength)
        .max(20, copy.errors.passwordLength),
      confirmPassword: z
        .string()
        .min(1, copy.errors.fieldRequired)
        .min(8, copy.errors.passwordLength)
        .max(20, copy.errors.passwordLength),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: copy.errors.passwordsMismatch,
      path: ["confirmPassword"],
    });
}

const inputBase =
  "h-[var(--design-input-min-height-x1,52px)] rounded-lg border px-3 text-sm text-[var(--input-text-color)] shadow-none transition-colors focus-visible:outline-none focus-visible:ring-0";

function inputClass(hasError: boolean, isFocused: boolean) {
  if (hasError) {
    return cn(inputBase, "border-destructive bg-[var(--input-error-bg-color)]");
  }
  if (isFocused) {
    return cn(
      inputBase,
      "border-[var(--input-focus-border-color)] bg-[var(--input-focus-bg-color)]",
    );
  }
  return cn(
    inputBase,
    "border-[var(--input-default-border-color)] bg-[var(--input-default-bg-color)]",
  );
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
}: PasswordFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs text-[var(--input-label-text-color)]">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="new-password"
          maxLength={128}
          className={cn(inputClass(hasError, focused), "pr-10")}
          aria-invalid={hasError}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-theme-500)]"
          onClick={onToggleShow}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
    </div>
  );
}

export default function ResetPasswordPage() {
  const copy = authContent.resetPassword;
  const queryClient = useQueryClient();
  const resetPassword = useResetPassword();
  const navigateBack = useNavigateBack("/login");
  const token = useMemo(() => readResetToken(), []);
  const passwordSchema = useMemo(() => buildPasswordSchema(copy), [copy]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showBanner, setShowBanner] = useState(false);
  const [step, setStep] = useState<Step>(token ? "form" : "invalid");

  const passwordError = fieldErrors.password;
  const confirmError = fieldErrors.confirmPassword;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitAttempted(true);
    setShowBanner(false);
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
      setShowBanner(true);
      return;
    }

    try {
      await resetPassword.mutateAsync({
        data: {
          token,
          password: parsed.data.password,
          confirmPassword: parsed.data.confirmPassword,
        },
      });
      await syncAuthSession(queryClient);
      setStep("success");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 400) {
        const body = err.data as { fieldErrors?: Record<string, string[]> } | undefined;
        if (body?.fieldErrors) {
          const next: Record<string, string> = {};
          for (const [key, messages] of Object.entries(body.fieldErrors)) {
            if (messages[0]) next[key] = messages[0];
          }
          setFieldErrors(next);
          setShowBanner(true);
          return;
        }
      }
      if (err instanceof ApiError && err.status === 401) {
        setStep("invalid");
        return;
      }
      setShowBanner(true);
      setFieldErrors({ confirmPassword: copy.errors.invalidToken });
    }
  };

  if (step === "invalid") {
    return (
      <AuthOverlayShell open onDismiss={navigateBack}>
        <p className="pr-10 text-xs font-bold uppercase tracking-widest text-[var(--neutral-theme-900)]">
          {copy.pageTitle}
        </p>
        <AuthBrandLogo className="mt-4" />
        <p className="mt-6 text-sm font-bold uppercase tracking-wide text-[var(--neutral-theme-900)]">
          {copy.cardTitle}
        </p>
        <p className="mt-3 text-sm text-destructive">{copy.missingToken}</p>
        <div className="mt-6 flex justify-center">
          <PillButton asChild>
            <Link href="/login">{copy.backToLogin}</Link>
          </PillButton>
        </div>
      </AuthOverlayShell>
    );
  }

  if (step === "success") {
    return (
      <AuthOverlayShell open onDismiss={() => goToCabinet()} allowDismiss={false}>
        <p className="pr-10 text-xs font-bold uppercase tracking-widest text-[var(--neutral-theme-900)]">
          {copy.pageTitle}
        </p>
        <AuthBrandLogo className="mt-4" />
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle2
            className="h-16 w-16 text-[var(--primary-theme-500)]"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="mt-6 text-sm font-bold uppercase tracking-wide text-[var(--neutral-theme-900)]">
            {copy.cardTitle}
          </p>
          <p className="mt-3 text-sm text-[var(--hint-text-color)]">{copy.successMessage}</p>
          <PillButton type="button" className="mt-8 w-full" onClick={() => goToCabinet()}>
            {copy.goToDashboard}
          </PillButton>
        </div>
      </AuthOverlayShell>
    );
  }

  return (
    <AuthOverlayShell
      open
      onDismiss={navigateBack}
      allowDismiss={!resetPassword.isPending}
    >
      <p className="pr-10 text-xs font-bold uppercase tracking-widest text-[var(--neutral-theme-900)]">
        {copy.pageTitle}
      </p>
      <AuthBrandLogo className="mt-4" />
      <p className="mt-4 text-sm font-bold uppercase tracking-wide text-[var(--neutral-theme-900)]">
        {copy.cardTitle}
      </p>

      <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <PasswordField
          id="reset-new-password"
          label={copy.newPassword}
          value={password}
          onChange={setPassword}
          show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
          hasError={Boolean(passwordError) || (submitAttempted && !password && !passwordError)}
          errorMessage={
            passwordError ??
            (submitAttempted && !password ? copy.errors.fieldRequired : undefined)
          }
        />

        <PasswordField
          id="reset-confirm-password"
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
            (submitAttempted && !confirmPassword ? copy.errors.fieldRequired : undefined)
          }
        />

        {showBanner && !passwordError && !confirmError ? (
          <div
            role="alert"
            className="rounded-lg bg-[var(--error-box-bg-color)] px-3 py-2.5 text-sm text-destructive"
          >
            {copy.errors.passwordsMismatch}
          </div>
        ) : null}

        <div className="flex justify-center pt-2">
          <PillButton type="submit" className="min-w-[160px]" disabled={resetPassword.isPending}>
            {resetPassword.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              copy.submit
            )}
          </PillButton>
        </div>
      </form>
    </AuthOverlayShell>
  );
}
