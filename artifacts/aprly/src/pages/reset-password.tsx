import { useMemo, useState } from "react";
import { Link } from "wouter";
import { z } from "zod";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@workspace/api-client-react/custom-fetch";
import { useResetPassword } from "@workspace/api-client-react";
import { authContent } from "@/content/landing";
import { syncAuthSession } from "@/lib/auth-session";
import { goToCabinet } from "@/lib/app-navigation";
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
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="reset-password-field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          maxLength={128}
          className={cn("reset-password-input pr-10", hasError && "reset-password-input--error")}
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
      {errorMessage ? <p className="reset-password-field-error">{errorMessage}</p> : null}
    </div>
  );
}

export default function ResetPasswordPage() {
  const copy = authContent.resetPassword;
  const queryClient = useQueryClient();
  const resetPassword = useResetPassword();
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
      <div className="reset-password-layout">
        <h1 className="reset-password-page-title">{copy.pageTitle}</h1>
        <section className="reset-password-card">
          <h2 className="reset-password-card-title">{copy.cardTitle}</h2>
          <p className="reset-password-error-banner">{copy.missingToken}</p>
          <div className="mt-6 flex justify-center">
            <Link href="/login" className="reset-password-primary-btn">
              {copy.backToLogin}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="reset-password-layout">
        <h1 className="reset-password-page-title">{copy.pageTitle}</h1>
        <section className="reset-password-card">
          <h2 className="reset-password-card-title">{copy.cardTitle}</h2>
          <div className="reset-password-success">
            <div className="reset-password-success-icon" aria-hidden>
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="reset-password-success-message">{copy.successMessage}</p>
            <button
              type="button"
              className="reset-password-primary-btn mt-6"
              onClick={() => goToCabinet()}
            >
              {copy.goToDashboard}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="reset-password-layout">
      <h1 className="reset-password-page-title">{copy.pageTitle}</h1>
      <section className="reset-password-card">
        <h2 className="reset-password-card-title">{copy.cardTitle}</h2>
        <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
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
            <div role="alert" className="reset-password-error-banner">
              {copy.errors.passwordsMismatch}
            </div>
          ) : null}

          <div className="flex justify-center pt-2">
            <button type="submit" className="reset-password-primary-btn" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                copy.submit
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
