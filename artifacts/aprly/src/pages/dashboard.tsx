import { useGetDashboardSummary } from "@workspace/api-client-react";
import { CreditScoreGauge } from "../components/credit-score-gauge";
import { PlaidLinkButton } from "../components/plaid-link-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, AlertCircle, TrendingDown, Clock, ShieldCheck } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading, error } = useGetDashboardSummary();

  if (isLoading || !summary) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-32 w-full bg-card/50" />
        <div className="grid md:grid-cols-3 gap-8">
          <Skeleton className="h-64 bg-card/50" />
          <Skeleton className="h-64 md:col-span-2 bg-card/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Debt</p>
              <p className="text-3xl font-bold">${summary.totalDebt.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-primary/20 md:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Estimated Annual Savings</p>
              <p className="text-4xl font-bold text-primary drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                ${summary.estimatedAnnualSavings.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Credit Health</CardTitle>
            </CardHeader>
            <CardContent>
              <CreditScoreGauge 
                score={summary.creditScore} 
                delta={summary.creditScoreDelta} 
                band={summary.creditScoreBand} 
              />
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Linked Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.linkedAccounts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No accounts linked yet.</p>
                  <PlaidLinkButton />
                </div>
              ) : (
                summary.linkedAccounts.map((acc, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-background border border-border/50">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{acc.institutionName}</p>
                        <p className="text-xs text-muted-foreground">•••• {acc.mask}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${acc.balance.toLocaleString()}</p>
                      <p className="text-xs text-destructive font-medium">{acc.apr}% APR</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Actionable Rate Reductions</CardTitle>
              <CardDescription>Opportunities to negotiate lower rates based on your profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.rateReductions.map((reduction) => (
                <div key={reduction.id} className="flex flex-col sm:flex-row justify-between items-center p-4 rounded-xl bg-background border border-border/50 gap-4">
                  <div>
                    <h4 className="font-semibold text-lg">{reduction.lender}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">{reduction.currentApr}%</Badge>
                      <span className="text-muted-foreground text-sm">→</span>
                      <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">{reduction.targetApr}%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Savings</p>
                      <p className="font-bold text-primary">${reduction.estimatedSavings.toLocaleString()}/yr</p>
                    </div>
                    {reduction.status === "recommended" ? (
                      <Button size="sm" className="shadow-[0_0_10px_rgba(59,130,246,0.3)]">Negotiate</Button>
                    ) : (
                      <Badge variant="secondary" className="capitalize">{reduction.status.replace("_", " ")}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Hardship Portal</CardTitle>
              <CardDescription>Bank Handshake Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm font-medium text-primary">{summary.hardshipPortal.stage}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /> ETA: {summary.hardshipPortal.etaDays} days
                  </div>
                </div>
                <Progress value={summary.hardshipPortal.progress} className="h-2" />
              </div>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {summary.hardshipPortal.steps.map((step, i) => {
                  const isActive = step.status === "active";
                  const isDone = step.status === "done";
                  return (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow">
                        {isDone ? (
                          <div className="w-3 h-3 bg-primary rounded-full" />
                        ) : isActive ? (
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        ) : (
                          <div className="w-3 h-3 bg-muted rounded-full" />
                        )}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border/50 bg-background/50">
                        <p className={`font-medium ${isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
