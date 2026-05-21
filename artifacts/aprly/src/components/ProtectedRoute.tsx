import type { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/lib/auth-session";
import { CabinetPageLoader } from "@/components/dashboard/CabinetPageLoader";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAuthPending, user } = useAuth();

  if (isAuthPending) {
    return <CabinetPageLoader />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (user?.role === "admin") {
    return <Redirect to="/admin/dashboard" />;
  }

  return <>{children}</>;
}
