import { useEffect, useMemo, useState } from "react";
import { useForgotPasswordFlow } from "@/lib/forgot-password-context";
import { Loader2 } from "lucide-react";
import { goToCabinet } from "@/lib/app-navigation";
import { readLoginReturnTo } from "@/lib/login-return-to";
import { useQueryClient } from "@tanstack/react-query";
import { useLogin } from "@workspace/api-client-react";
import { syncAuthSession, useAuth } from "@/lib/auth-session";
import { AuthBrandLogo } from "@/components/auth/AuthBrandLogo";
import { AuthOverlayShell } from "@/components/auth/AuthOverlayShell";
import { AuthPasswordInput } from "@/components/shared/auth-form/AuthPasswordInput";
import { AuthTextInput } from "@/components/shared/auth-form/AuthTextInput";
import { PillButton } from "@/components/shared/PillButton";
import { authContent } from "@/content/landing";
import { useNavigateBack } from "@/lib/navigate-back";
import { useSignupCheckout } from "@/lib/signup-checkout-context";

export default function LoginPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const login = useLogin();
  const { openSignup } = useSignupCheckout();
  const navigateBack = useNavigateBack("/");
  const { openForgotPassword } = useForgotPasswordFlow();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [authError, setAuthError] = useState(false);
  const returnTo = useMemo(
    () => readLoginReturnTo(window.location.search),
    [],
  );

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      goToCabinet(returnTo);
    }
  }, [isAuthenticated, isLoading, returnTo]);

  if (!isLoading && isAuthenticated) {
    return null;
  }

  const emailEmpty = submitAttempted && !email.trim();
  const passwordEmpty = submitAttempted && !password;
  const credentialsInvalid = authError && !emailEmpty && !passwordEmpty;
  const showAuthErrorBox = credentialsInvalid;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setAuthError(false);
    if (!email.trim() || !password) return;

    try {
      await login.mutateAsync({ data: { email, password } });
      await syncAuthSession(queryClient);
      goToCabinet(returnTo);
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
      <p className="app-header-h6 text-average pr-10">
        {authContent.login.title}
      </p>

      <div className="mt-2">
        <AuthBrandLogo />
      </div>

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <AuthTextInput
          id="login-email"
          label={authContent.login.emailLabel}
          type="email"
          autoComplete="email"
          value={email}
          invalid={emailEmpty || credentialsInvalid}
          error={emailEmpty ? authContent.login.errors.emailRequired : null}
          onChange={(e) => {
            setEmail(e.target.value);
            setAuthError(false);
          }}
        />

        <AuthPasswordInput
          id="login-password"
          label={authContent.login.passwordLabel}
          autoComplete="current-password"
          value={password}
          invalid={passwordEmpty || credentialsInvalid}
          error={passwordEmpty ? authContent.login.errors.passwordRequired : null}
          onChange={(e) => {
            setPassword(e.target.value);
            setAuthError(false);
          }}
        />

        {showAuthErrorBox ? (
          <div
            role="alert"
            className="app-text-p1-regular rounded-[12px] border border-[var(--danger-theme-300)] bg-[var(--error-box-bg-color)] px-3 py-2.5 text-[var(--danger-theme-700)]"
          >
            {authContent.login.errors.invalid}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            className="app-button-button-l-m text-action hover:underline"
            onClick={openForgotPassword}
          >
            {authContent.login.forgot}
          </button>
          <PillButton type="submit" disabled={login.isPending} className="min-w-[120px]">
            {login.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              authContent.login.submit
            )}
          </PillButton>
        </div>
      </form>

      <div className="mx-2.5 mt-6 border-t border-[var(--primary-theme-200)] pt-5 text-center">
        <span className="app-text-p1-regular text-hint">
          {authContent.login.signupPrompt}{" "}
        </span>
        <button
          type="button"
          className="app-button-button-l-m text-action hover:underline"
          onClick={() => openSignup()}
        >
          {authContent.login.signupLink}
        </button>
      </div>
    </AuthOverlayShell>
  );
}
