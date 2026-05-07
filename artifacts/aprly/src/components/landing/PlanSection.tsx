import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const PLAN_FEATURES = [
  "24/7 automated rate negotiation",
  "Hardship portal management",
  "Real-time waste alerts",
  "Priority human support",
  "One-time access fee — no subscription",
];

export function PlanSection() {
  return (
    <section id="plan" className="px-4 py-20 md:py-28 scroll-mt-24">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-primary mb-3">
                Audit Access
              </p>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-5 leading-[0.95]">
                Stop paying banks
                <br />
                for your own money.
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground">
                One flat price. Every account watched. Every day.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/50">
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-bold tracking-tighter">$39</span>
                <span className="text-muted-foreground mb-1">one-time</span>
              </div>

              <ul className="space-y-4">
                {PLAN_FEATURES.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground/90">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <Card className="bg-card border-border/50 shadow-2xl">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg font-semibold mb-6">
                  Activate Your Plan
                </h3>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="plan-email">Email</Label>
                    <Input
                      id="plan-email"
                      type="email"
                      placeholder="you@example.com"
                      disabled
                      aria-disabled="true"
                      className="bg-background"
                    />
                  </div>

                  <Button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="w-full h-12 text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] mt-4 disabled:shadow-none"
                  >
                    Start Audit Access — $39 one-time
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Available after stage launch (Stripe pending)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
