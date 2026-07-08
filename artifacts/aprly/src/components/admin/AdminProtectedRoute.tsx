import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { getGetAdminMeQueryKey, useGetAdminMe } from "@workspace/api-client-react";
import { goToAdminLogin } from "@/lib/app-navigation";

export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const adminMe = useGetAdminMe({
    query: {
      queryKey: getGetAdminMeQueryKey(),
      retry: false,
    },
  });

  const isAuthorized = Boolean(adminMe.data && adminMe.data.role === "admin");

  useEffect(() => {
    if (!adminMe.isLoading && !isAuthorized) {
      goToAdminLogin();
    }
  }, [adminMe.isLoading, isAuthorized]);

  if (adminMe.isLoading || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-background text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
