import { useMemo, useState } from "react";
import { Link } from "wouter";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@workspace/api-client-react/custom-fetch";
import { useResetPassword } from "@workspace/api-client-react";
import { AuthBrandLogo } from "@/components/auth/AuthBrandLogo";
import { AuthOverlayShell } from "@/components/auth/AuthOverlayShell";
import { AuthPasswordInput } from "@/components/shared/auth-form/AuthPasswordInput";
import { PillButton } from "@/components/shared/PillButton";
import { authContent } from "@/content/landing";
import { syncAuthSession } from "@/lib/auth-session";
import { goToCabinet } from "@/lib/app-navigation";
import { useNavigateBack } from "@/lib/navigate-back";

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

export default function ResetPasswordPage() {
  const copy = authContent.resetPassword;
  const queryClient = useQueryClient();
  const resetPassword = useResetPassword();
  const navigateBack = useNavigateBack("/login");
  const token = useMemo(() => readResetToken(), []);
  const passwordSchema = useMemo(() => buildPasswordSchema(copy), [copy]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
        <p className="app-header-screen-title-bold text-average pr-10">{copy.pageTitle}</p>
        <AuthBrandLogo className="mt-4" />
        <p className="app-header-h6 text-title mt-6">{copy.cardTitle}</p>
        <p className="app-text-p1-regular mt-3 text-[var(--danger-theme-700)]">{copy.missingToken}</p>
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
        <p className="app-header-screen-title-bold text-average pr-10">{copy.pageTitle}</p>
        <AuthBrandLogo className="mt-4" />
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle2
            className="h-16 w-16 text-[var(--action-default-color)]"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="app-header-h6 text-title mt-6">{copy.cardTitle}</p>
          <p className="app-text-p1-regular text-hint mt-3">{copy.successMessage}</p>
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
      <p className="app-header-screen-title-bold text-average pr-10">{copy.pageTitle}</p>
      <AuthBrandLogo className="mt-4" />
      <p className="app-header-h6 text-title mt-4">{copy.cardTitle}</p>

      <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <AuthPasswordInput
          id="reset-new-password"
          label={copy.newPassword}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          maxLength={128}
          error={
            passwordError ??
            (submitAttempted && !password ? copy.errors.fieldRequired : undefined)
          }
        />

        <AuthPasswordInput
          id="reset-confirm-password"
          label={copy.confirmPassword}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          maxLength={128}
          error={
            confirmError ??
            (submitAttempted && !confirmPassword ? copy.errors.fieldRequired : undefined)
          }
        />

        {showBanner && !passwordError && !confirmError ? (
          <div
            role="alert"
            className="app-text-p1-regular rounded-[12px] border border-[var(--danger-theme-300)] bg-[var(--error-box-bg-color)] px-3 py-2.5 text-[var(--danger-theme-700)]"
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
