import { useEffect, useState } from "react";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { CreditScoreGauge } from "../components/credit-score-gauge";
import { PlaidLinkButton } from "../components/plaid-link-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, AlertCircle, TrendingDown, Clock, ShieldCheck } from "lucide-react";

const HERO_COPY = [
  {
    eyebrow: "Your cockpit",
    headline: "Dashboard",
    tagline: "Every dollar of interest you stop paying today compounds for years. Let's go.",
  },
  {
    eyebrow: "Your cockpit",
    headline: "Stop the bleed.",
    tagline: "Right now your APR is quietly stealing from your future. Today, we hand it back.",
  },
  {
    eyebrow: "Your money, rewired",
    headline: "Outsmart your APR.",
    tagline: "The banks bet you won't fight back. Prove them wrong, one rate cut at a time.",
  },
  {
    eyebrow: "Command center",
    headline: "Every basis point matters.",
    tagline: "Lower the rate, shorten the runway, keep the difference. This is how debt actually dies.",
  },
] as const;

function HeroRotator() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const tick = setInterval(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        setIndex((i) => (i + 1) % HERO_COPY.length);
        setVisible(true);
      }, 450);
      return () => clearTimeout(swap);
    }, 6000);
    return () => clearInterval(tick);
  }, []);

  const copy = HERO_COPY[index];

  return (
    <div
      className={`max-w-3xl transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
      aria-live="polite"
    >
      <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-primary mb-4">
        {copy.eyebrow}
      </p>
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
        {copy.headline}
      </h1>
      <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">
        {copy.tagline}
      </p>
    </div>
  );
}

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
    <div className="container mx-auto px-4 py-12 md:py-16 space-y-10">
      <HeroRotator />
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Total Debt</p>
              <p className="text-4xl md:text-5xl font-black tracking-tight">${summary.totalDebt.toLocaleString()}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/30 md:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <CardContent className="p-8 flex items-center justify-between relative z-10 gap-6">
            <div>
              <p className="text-sm md:text-base font-bold text-primary uppercase tracking-[0.2em] mb-2">Estimated Annual Savings</p>
              <p className="text-5xl md:text-6xl font-black tracking-tight text-primary drop-shadow-[0_0_18px_rgba(59,130,246,0.7)]">
                ${summary.estimatedAnnualSavings.toLocaleString()}
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <TrendingDown className="h-7 w-7 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-black tracking-tight">Credit Health</CardTitle>
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
              <CardTitle className="text-2xl font-black tracking-tight">Linked Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.linkedAccounts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-base text-muted-foreground mb-5 font-medium">No accounts linked yet.</p>
                  <PlaidLinkButton />
                </div>
              ) : (
                summary.linkedAccounts.map((acc, i) => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-lg bg-background border border-border/50">
                    <div className="flex items-center gap-3">
                      <Building className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-bold text-base">{acc.institutionName}</p>
                        <p className="text-sm text-muted-foreground">•••• {acc.mask}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg">${acc.balance.toLocaleString()}</p>
                      <p className="text-sm text-destructive font-bold">{acc.apr}% APR</p>
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
              <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">Actionable Rate Reductions</CardTitle>
              <CardDescription className="text-base">Opportunities to negotiate lower rates based on your profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.rateReductions.map((reduction) => (
                <div key={reduction.id} className="flex flex-col sm:flex-row justify-between items-center p-5 rounded-xl bg-background border border-border/50 gap-4">
                  <div>
                    <h4 className="font-black text-xl tracking-tight">{reduction.lender}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-sm font-bold px-2.5 py-0.5">{reduction.currentApr}%</Badge>
                      <span className="text-muted-foreground text-base font-bold">→</span>
                      <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 text-sm font-bold px-2.5 py-0.5">{reduction.targetApr}%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Est. Savings</p>
                      <p className="font-black text-xl text-primary">${reduction.estimatedSavings.toLocaleString()}/yr</p>
                    </div>
                    {reduction.status === "recommended" ? (
                      <Button
                        size="lg"
                        className="font-black uppercase tracking-wider text-base px-6 shadow-[0_0_18px_rgba(59,130,246,0.55)] hover:shadow-[0_0_24px_rgba(59,130,246,0.8)] transition-shadow"
                      >
                        Negotiate
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="capitalize text-sm font-bold px-3 py-1">{reduction.status.replace("_", " ")}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">Hardship Portal</CardTitle>
              <CardDescription className="text-base">Bank Handshake Progress</CardDescription>
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
