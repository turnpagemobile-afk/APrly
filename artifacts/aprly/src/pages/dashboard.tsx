import { Link } from "wouter";
import { useGetDashboardSummary, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const summary = useGetDashboardSummary();
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      window.location.href = "/";
    } catch {
      toast({ title: "Sign out failed", variant: "destructive" });
    }
  };

  if (summary.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }

  if (summary.isError) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-destructive">Could not load your dashboard.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            signing in again
          </Link>
          .
        </p>
      </div>
    );
  }

  const data = summary.data;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button type="button" variant="outline" onClick={() => void handleLogout()}>
          Sign out
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Summary (demo data): credit score {data?.creditScore}, estimated savings ~$
        {data?.estimatedAnnualSavings?.toLocaleString()} / year.
      </p>
      <div className="mt-8 rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Full dashboard UI will be expanded later. For now this confirms auth and the protected{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-foreground">GET /api/dashboard/summary</code>{" "}
        request.
      </div>
    </div>
  );
}
