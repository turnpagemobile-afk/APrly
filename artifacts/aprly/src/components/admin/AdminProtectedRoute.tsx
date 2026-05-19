import type { ReactNode } from "react";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { getGetAdminMeQueryKey, useGetAdminMe } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-session";

export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthPending } = useAuth();
  const adminMe = useGetAdminMe({
    query: {
      queryKey: getGetAdminMeQueryKey(),
      retry: false,
    },
  });

  if (isAuthPending || adminMe.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-background text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  if (!adminMe.data || adminMe.data.role !== "admin") {
    return <Redirect to="/admin/login" />;
  }

  return <>{children}</>;
}
