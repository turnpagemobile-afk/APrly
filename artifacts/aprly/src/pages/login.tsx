import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useForgotPasswordFlow } from "@/lib/forgot-password-context";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { goToCabinet } from "@/lib/app-navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useLogin } from "@workspace/api-client-react";
import { syncAuthSession, useAuth } from "@/lib/auth-session";
import { AuthBrandLogo } from "@/components/auth/AuthBrandLogo";
import { AuthOverlayShell } from "@/components/auth/AuthOverlayShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authContent } from "@/content/landing";
import { useNavigateBack } from "@/lib/navigate-back";
import { useSignupCheckout } from "@/lib/signup-checkout-context";
import { cn } from "@/lib/utils";

type FocusedField = "email" | "password" | null;

const loginInputBase =
  "h-[var(--design-input-min-height-x1,52px)] rounded-lg border px-3 text-sm text-[var(--input-text-color)] shadow-none transition-colors focus-visible:outline-none focus-visible:ring-0";

function loginInputClass(fieldError: boolean, isFocused: boolean) {
  if (fieldError) {
    return cn(
      loginInputBase,
      "border-destructive bg-[var(--input-error-bg-color)]",
    );
  }
  if (isFocused) {
    return cn(
      loginInputBase,
      "border-[var(--input-focus-border-color)] bg-[var(--input-focus-bg-color)]",
    );
  }
  return cn(
    loginInputBase,
    "border-[var(--input-default-border-color)] bg-[var(--input-default-bg-color)]",
  );
}

export default function LoginPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const login = useLogin();
  const { openSignup } = useSignupCheckout();
  const navigateBack = useNavigateBack("/");
  const { openForgotPassword } = useForgotPasswordFlow();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      goToCabinet();
    }
  }, [isAuthenticated, isLoading]);

  if (!isLoading && isAuthenticated) {
    return null;
  }

  const emailEmpty = submitAttempted && !email.trim();
  const passwordEmpty = submitAttempted && !password;
  const emailFieldError = emailEmpty || (authError && !emailEmpty && !passwordEmpty);
  const passwordFieldError = passwordEmpty || (authError && !emailEmpty && !passwordEmpty);
  const showAuthErrorBox = authError && !emailEmpty && !passwordEmpty;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setAuthError(false);
    if (!email.trim() || !password) return;

    try {
      await login.mutateAsync({ data: { email, password } });
      await syncAuthSession(queryClient);
      goToCabinet();
    } catch {
      setAuthError(true);
    }
  };

  return (
    <AuthOverlayShell
      open
      onDismiss={navigateBack}
      allowDismiss={!login.isPending}
    >
      <p className="pr-10 text-xs font-bold uppercase tracking-widest text-[var(--neutral-theme-900)]">
        {authContent.login.title}
      </p>

      <div className="mt-2">
        <AuthBrandLogo />
      </div>

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label
            htmlFor="login-email"
            className="text-xs text-[var(--input-label-text-color)]"
          >
            {authContent.login.emailLabel}
          </Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField((f) => (f === "email" ? null : f))}
            onChange={(e) => {
              setEmail(e.target.value);
              setAuthError(false);
            }}
            className={loginInputClass(emailFieldError, focusedField === "email")}
          />
          {emailEmpty ? (
            <p className="text-sm text-destructive">{authContent.login.errors.emailRequired}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="login-password"
            className="text-xs text-[var(--input-label-text-color)]"
          >
            {authContent.login.passwordLabel}
          </Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField((f) => (f === "password" ? null : f))}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError(false);
              }}
              className={cn(
                loginInputClass(passwordFieldError, focusedField === "password"),
                "pr-10",
              )}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordEmpty ? (
            <p className="text-sm text-destructive">
              {authContent.login.errors.passwordRequired}
            </p>
          ) : null}
        </div>

        {showAuthErrorBox ? (
          <div
            role="alert"
            className="rounded-lg bg-[var(--error-box-bg-color)] px-3 py-2.5 text-sm text-destructive"
          >
            {authContent.login.errors.invalid}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            className="text-xs font-semibold uppercase text-primary hover:underline"
            onClick={openForgotPassword}
          >
            {authContent.login.forgot}
          </button>
          <Button
            type="submit"
            disabled={login.isPending}
            className="min-w-[120px] font-bold uppercase tracking-wide"
          >
            {login.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              authContent.login.submit
            )}
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-[var(--hint-text-color)]">
        {authContent.login.signupPrompt}{" "}
        <button
          type="button"
          className="font-bold uppercase text-primary hover:underline"
          onClick={() => openSignup()}
        >
          {authContent.login.signupLink}
        </button>
      </p>
    </AuthOverlayShell>
  );
}
