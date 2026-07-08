import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import {
  getGetAdminMeQueryKey,
  useAdminLogin,
  useGetAdminMe,
} from "@workspace/api-client-react";
import { AdminAuthLayout } from "@/components/admin/AdminAuthLayout";
import { AuthPasswordInput } from "@/components/shared/auth-form/AuthPasswordInput";
import { AuthTextInput } from "@/components/shared/auth-form/AuthTextInput";
import { adminContent } from "@/content/admin";
import { brandContent } from "@/content/landing";
import { adminAsset } from "@/lib/admin-assets";
import { goToAdmin } from "@/lib/app-navigation";
import { saveAdminChallenge } from "@/lib/admin-auth-flow";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const login = useAdminLogin();
  const adminMe = useGetAdminMe({
    query: {
      queryKey: getGetAdminMeQueryKey(),
      retry: false,
    },
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [authError, setAuthError] = useState(false);

  const isAlreadyAdmin =
    Boolean(adminMe.data) && adminMe.data?.role === "admin";

  useEffect(() => {
    if (!adminMe.isLoading && isAlreadyAdmin) {
      goToAdmin("/admin/dashboard");
    }
  }, [adminMe.isLoading, isAlreadyAdmin]);

  if (adminMe.isLoading || isAlreadyAdmin) {
    return (
      <AdminAuthLayout>
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      </AdminAuthLayout>
    );
  }

  const emailEmpty = submitAttempted && !email.trim();
  const passwordEmpty = submitAttempted && !password;
  const credentialsInvalid = authError && !emailEmpty && !passwordEmpty;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setAuthError(false);
    if (!email.trim() || !password) return;

    try {
      const result = await login.mutateAsync({
        data: { email: email.trim(), password },
      });
      saveAdminChallenge(result.challengeToken, result.email);
      navigate("/admin/verify");
    } catch {
      setAuthError(true);
    }
  };

  return (
    <AdminAuthLayout>
      <img
        src={adminAsset("login/logo.png")}
        alt={brandContent.name}
        className="admin-auth-logo"
      />
      <h1 className="app-header-h6 text-average mt-6 text-center">{adminContent.login.title}</h1>
      <form className="mt-6 space-y-5" onSubmit={(e) => void onSubmit(e)}>
        <AuthTextInput
          id="admin-email"
          label={adminContent.login.email}
          type="email"
          autoComplete="email"
          value={email}
          invalid={emailEmpty || credentialsInvalid}
          error={emailEmpty ? adminContent.login.errors.emailRequired : null}
          onChange={(e) => {
            setEmail(e.target.value);
            setAuthError(false);
          }}
        />
        <AuthPasswordInput
          id="admin-password"
          label={adminContent.login.password}
          autoComplete="current-password"
          value={password}
          invalid={passwordEmpty || credentialsInvalid}
          error={passwordEmpty ? adminContent.login.errors.passwordRequired : null}
          onChange={(e) => {
            setPassword(e.target.value);
            setAuthError(false);
          }}
        />
        {credentialsInvalid ? (
          <div
            role="alert"
            className="rounded-[12px] bg-[var(--error-box-bg-color)] px-3 py-2.5 text-sm text-destructive"
          >
            {adminContent.login.errors.invalid}
          </div>
        ) : null}
        <button
          type="submit"
          className="admin-auth-submit-btn app-button-button-l-m text-neutral-000"
          disabled={login.isPending}
        >
          {login.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            adminContent.login.submit
          )}
        </button>
      </form>
    </AdminAuthLayout>
  );
}
