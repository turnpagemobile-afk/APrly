import { Link } from "wouter";
import { useGetDashboardSummary, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

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
  const linkedAccounts = data?.linkedAccounts ?? [];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button type="button" variant="outline" onClick={() => void handleLogout()}>
          Sign out
        </Button>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Credit score {data?.creditScore} ({data?.creditScoreBand}). Estimated savings ~
        {formatCurrency(data?.estimatedAnnualSavings ?? 0)} / year on{" "}
        {formatCurrency(data?.totalDebt ?? 0)} total debt.
      </p>

      <Card className="mt-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Linked accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {linkedAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No cards on file yet. Complete the optimizer on the home page and activate your plan
              to import your balances here.
            </p>
          ) : (
            <ul className="divide-y">
              {linkedAccounts.map((account) => (
                <li
                  key={`${account.institutionName}-${account.mask}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{account.institutionName}</p>
                    <p className="text-xs text-muted-foreground">•••• {account.mask}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{formatCurrency(account.balance)}</p>
                    <p className="text-muted-foreground">{account.apr.toFixed(2)}% APR</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
