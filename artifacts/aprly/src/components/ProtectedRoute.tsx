import type { ReactNode } from "react";
import { Redirect } from "wouter";
import { goToAdmin, goToLanding } from "@/lib/app-navigation";
import { currentReturnToPath, loginHref } from "@/lib/login-return-to";
import { useAuth } from "@/lib/auth-session";
import { CabinetPageLoader } from "@/components/dashboard/CabinetPageLoader";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAuthPending, user } = useAuth();

  if (isAuthPending) {
    return <CabinetPageLoader />;
  }

  if (!isAuthenticated) {
    const loginPath = loginHref(currentReturnToPath());
    if (__APRLY_APP__ === "cabinet") {
      goToLanding(loginPath);
      return <CabinetPageLoader />;
    }
    return <Redirect to={loginPath} />;
  }

  if (user?.role === "admin") {
    if (__APRLY_APP__ === "cabinet") {
      goToAdmin("/admin/dashboard");
      return <CabinetPageLoader />;
    }
    return <Redirect to="/admin/dashboard" />;
  }

  return <>{children}</>;
}
