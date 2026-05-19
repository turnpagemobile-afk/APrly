import type { ReactNode } from "react";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-session";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAuthPending, user } = useAuth();

  if (isAuthPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (user?.role === "admin") {
    return <Redirect to="/admin/dashboard" />;
  }

  return <>{children}</>;
}
