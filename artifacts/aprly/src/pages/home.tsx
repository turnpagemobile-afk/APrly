import { useEffect, useState } from "react";
import { useCalculateOptimization, useCreateLead } from "@workspace/api-client-react";
import { VoiceStore } from "../components/layout";
import { PlaidLinkButton } from "../components/plaid-link-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Lock, CreditCard, Building } from "lucide-react";
import { motion, useAnimation, animate } from "framer-motion";
import { useLocation } from "wouter";

function AnimatedNumber({ value, isWaste }: { value: number; isWaste?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.8,
      onUpdate: (v) => setDisplayValue(v),
      ease: "easeOut",
    });
    return controls.stop;
  }, [value]);

  const isRed = isWaste && value > 10;
  
  return (
    <motion.span
      className={`font-mono tabular-nums ${isRed ? "text-destructive drop-shadow-[0_0_12px_rgba(220,38,38,0.8)]" : "text-primary drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]"}`}
      animate={isRed ? { scale: [1, 1.05, 1] } : {}}
      transition={isRed ? { repeat: Infinity, duration: 2 } : {}}
    >
      ${displayValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </motion.span>
  );
}

export default function Home() {
  const [totalDebt, setTotalDebt] = useState<string>("15000");
  const [interestRate, setInterestRate] = useState<string>("24.99");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [_, setLocation] = useLocation();

  const calculateOpt = useCalculateOptimization();
  const createLead = useCreateLead();

  useEffect(() => {
    return VoiceStore.subscribe((data) => {
      if (data.totalDebt !== undefined) setTotalDebt(data.totalDebt.toString());
      if (data.interestRate !== undefined) setInterestRate(data.interestRate.toString());
    });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const debt = parseFloat(totalDebt);
      const rate = parseFloat(interestRate);
      if (!isNaN(debt) && !isNaN(rate)) {
        calculateOpt.mutate({
          data: { totalDebt: debt, interestRate: rate, targetRate: 2 },
        });
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [totalDebt, interestRate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead.mutateAsync({
        data: {
          name: name || "Anonymous",
          email: email || "test@example.com",
          totalDebt: parseFloat(totalDebt) || 0,
          interestRate: parseFloat(interestRate),
        },
      });
      setLocation("/dashboard");
    } catch (e) {
      console.error(e);
    }
  };

  const res = calculateOpt.data;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-[120px] -z-10 translate-y-[-50%]" />
        
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Stop feeding the banks. <br/>
              <span className="text-primary drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">Take your money back.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              APRly is your high-end wealth management cockpit to kill credit card and personal loan interest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Calculator Form */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="debt" className="text-sm font-medium">Total Debt ($)</Label>
                    <Input
                      id="debt"
                      type="number"
                      value={totalDebt}
                      onChange={(e) => setTotalDebt(e.target.value)}
                      className="text-xl h-12 bg-background border-border/50 focus-visible:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rate" className="text-sm font-medium">Current Interest Rate (% APR)</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="text-xl h-12 bg-background border-border/50 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="pt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">Save your plan to continue (Optional)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="First Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background border-border/50"
                      />
                      <Input
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background border-border/50"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-[0_0_20px_rgba(59,130,246,0.4)]" disabled={calculateOpt.isPending}>
                    {calculateOpt.isPending ? "Calculating..." : "Save My Plan"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6" aria-live="polite">
              <Card className="bg-card/30 backdrop-blur border-border/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-50" />
                <CardContent className="p-8 text-center relative z-10">
                  <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Daily Interest Waste
                  </div>
                  <div className="text-6xl font-bold tracking-tighter">
                    <AnimatedNumber value={res?.dailyInterestWaste || 0} isWaste />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-card/30 backdrop-blur border-border/30 text-center p-6">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Monthly Savings</div>
                  <div className="text-3xl font-bold text-primary"><AnimatedNumber value={res?.monthlySavings || 0} /></div>
                </Card>
                <Card className="bg-card/30 backdrop-blur border-border/30 text-center p-6">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Annual Savings</div>
                  <div className="text-3xl font-bold text-primary"><AnimatedNumber value={res?.annualSavings || 0} /></div>
                </Card>
              </div>

              <div className="pt-6 flex justify-center">
                <PlaidLinkButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-border/40 bg-card/20 py-6">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-12 text-muted-foreground/80 opacity-70 grayscale">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <Building className="h-5 w-5" /> PLAID
          </div>
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <CreditCard className="h-5 w-5" /> STRIPE
          </div>
          <div className="flex items-center gap-2 font-medium text-sm tracking-widest uppercase">
            <Lock className="h-4 w-4" /> 256-bit Encryption
          </div>
        </div>
      </section>
    </div>
  );
}
