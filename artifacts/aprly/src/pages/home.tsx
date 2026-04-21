import { useEffect, useRef, useState } from "react";
import { useCalculateOptimization, useCreateLead } from "@workspace/api-client-react";
import { VoiceStore } from "../components/layout";
import { PlaidLinkButton } from "../components/plaid-link-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lock,
  CreditCard,
  Building,
  ArrowDown,
  Flame,
  TrendingDown,
  Calendar,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { useLocation } from "wouter";

const SLOGAN_STRINGS = [
  "Stop feeding the banks. Take your money back.",
  "Your rate is bleeding you dry. We're the tourniquet.",
  "Every day you wait costs you real money.",
  "Crush your interest rate. Keep your paycheck.",
  "The smartest move you'll make this year.",
] as const;

const SLOGANS: { full: string; lead: string; accent: string }[] = [
  { full: SLOGAN_STRINGS[0], lead: "Stop feeding the banks.", accent: "Take your money back." },
  { full: SLOGAN_STRINGS[1], lead: "Your rate is bleeding you dry.", accent: "We're the tourniquet." },
  { full: SLOGAN_STRINGS[2], lead: "Every day you wait", accent: "costs you real money." },
  { full: SLOGAN_STRINGS[3], lead: "Crush your interest rate.", accent: "Keep your paycheck." },
  { full: SLOGAN_STRINGS[4], lead: "The smartest move", accent: "you'll make this year." },
];

function RotatingHeadline() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLOGANS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [paused]);

  const current = SLOGANS[index];

  return (
    <div
      className="relative min-h-[14rem] sm:min-h-[18rem] md:min-h-[22rem] lg:min-h-[26rem] flex items-center justify-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* SR-only: announce the active slogan to assistive tech */}
      <span className="sr-only" aria-live="polite">
        {current.full}
      </span>

      <AnimatePresence mode="wait">
        <motion.h1
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          aria-hidden
          className="absolute inset-0 flex flex-col items-center justify-center text-center font-black tracking-[-0.04em] leading-[0.95] text-5xl sm:text-7xl md:text-8xl lg:text-9xl"
        >
          <span className="block text-foreground">{current.lead}</span>
          <span className="block mt-2 md:mt-4 bg-gradient-to-r from-sky-300 via-primary to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(56,189,248,0.45)]">
            {current.accent}
          </span>
        </motion.h1>
      </AnimatePresence>

      {/* Slogan dots */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {SLOGANS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show slogan ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function AnimatedNumber({ value, isWaste }: { value: number; isWaste?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.8,
      onUpdate: (v) => setDisplayValue(v),
      ease: "easeOut",
    });
    return () => { controls.stop(); };
  }, [value]);

  const isRed = isWaste && value > 10;

  return (
    <motion.span
      className={`font-mono tabular-nums ${
        isRed
          ? "text-destructive drop-shadow-[0_0_18px_rgba(248,113,113,0.7)]"
          : "text-primary drop-shadow-[0_0_18px_rgba(56,189,248,0.7)]"
      }`}
      animate={isRed ? { scale: [1, 1.04, 1] } : {}}
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
  const calcRef = useRef<HTMLDivElement>(null);

  const calculateOpt = useCalculateOptimization();
  const createLead = useCreateLead();

  useEffect(() => {
    const unsub = VoiceStore.subscribe((data) => {
      if (data.totalDebt !== undefined) setTotalDebt(data.totalDebt.toString());
      if (data.interestRate !== undefined) setInterestRate(data.interestRate.toString());
    });
    return () => { unsub(); };
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

  const scrollToCalc = () => {
    calcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const res = calculateOpt.data;

  return (
    <div className="flex flex-col">
      {/* HERO — owns the first fold */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[800px] bg-primary/15 blur-[160px] rounded-full" />
        </div>

        <div className="container mx-auto max-w-6xl">
          <RotatingHeadline />

          <p className="mx-auto mt-16 md:mt-24 max-w-2xl text-center text-xl md:text-2xl font-medium text-muted-foreground leading-relaxed">
            APRly is the wealth cockpit that hunts down credit card and personal loan interest — and gives it back.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={scrollToCalc}
              className="h-14 px-10 text-lg font-bold shadow-[0_0_30px_rgba(56,189,248,0.45)] hover:shadow-[0_0_40px_rgba(56,189,248,0.65)] transition-shadow"
            >
              See What You're Wasting
              <ArrowDown className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => setLocation("/paywall")}
              className="h-14 px-8 text-lg font-semibold text-foreground/80 hover:text-foreground"
            >
              See the Plan — $39/mo
            </Button>
          </div>
        </div>
      </section>

      {/* OPTIMIZER — matches Dashboard's card language */}
      <section ref={calcRef} className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-6xl space-y-12">
          {/* Header — same eyebrow + black headline scale as Dashboard */}
          <div className="max-w-3xl">
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-primary mb-4">
              The Optimizer
            </p>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
              See it in dollars per day.
            </h2>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">
              Type your debt and rate. We'll show the leak in real time — and exactly what we can claw back.
            </p>
          </div>

          {/* Top stat row — Daily Waste hero card spans 2 cols, like Dashboard's savings card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <p className="text-sm md:text-base font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">
                    Total Debt
                  </p>
                  <p className="text-4xl md:text-5xl font-black tracking-tight">
                    <AnimatedNumber value={parseFloat(totalDebt) || 0} />
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <CreditCard className="h-7 w-7 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-destructive/30 md:col-span-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-destructive/5" />
              <CardContent className="p-8 flex items-center justify-between relative z-10 gap-6">
                <div>
                  <p className="text-sm md:text-base font-bold text-destructive uppercase tracking-[0.2em] mb-2">
                    Daily Interest Waste
                  </p>
                  <p className="text-5xl md:text-6xl font-black tracking-tight leading-none">
                    <AnimatedNumber value={res?.dailyInterestWaste || 0} isWaste />
                  </p>
                  <p className="mt-2 text-sm md:text-base font-medium text-muted-foreground">
                    Gone, every single day.
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                  <Flame className="h-7 w-7 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Two-column: form + savings results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Inputs card */}
            <Card className="bg-card border-border/50 lg:col-span-2">
              <CardContent className="p-8 space-y-8">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                    Your Numbers
                  </h3>
                  <p className="text-base text-muted-foreground mt-1">
                    Updates instantly as you type.
                  </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="debt"
                        className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        Total Debt ($)
                      </Label>
                      <Input
                        id="debt"
                        type="number"
                        value={totalDebt}
                        onChange={(e) => setTotalDebt(e.target.value)}
                        className="text-2xl h-16 font-black bg-background border-border/60 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="rate"
                        className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        Current Rate (%)
                      </Label>
                      <Input
                        id="rate"
                        type="number"
                        step="0.01"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className="text-2xl h-16 font-black bg-background border-border/60 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Save your plan (optional)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        placeholder="First Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 text-base bg-background border-border/60"
                      />
                      <Input
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-base bg-background border-border/60"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full font-black uppercase tracking-wider text-base px-6 shadow-[0_0_18px_rgba(59,130,246,0.55)] hover:shadow-[0_0_24px_rgba(59,130,246,0.8)] transition-shadow"
                    disabled={calculateOpt.isPending}
                  >
                    {calculateOpt.isPending ? "Calculating..." : "Save My Plan"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right: Savings stack */}
            <div className="space-y-6" aria-live="polite">
              <Card className="bg-card border-primary/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <CardContent className="p-6 relative z-10 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">
                      Monthly Savings
                    </p>
                    <p className="text-3xl md:text-4xl font-black tracking-tight text-primary drop-shadow-[0_0_14px_rgba(59,130,246,0.55)]">
                      <AnimatedNumber value={res?.monthlySavings || 0} />
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-primary/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <CardContent className="p-6 relative z-10 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">
                      Annual Savings
                    </p>
                    <p className="text-3xl md:text-4xl font-black tracking-tight text-primary drop-shadow-[0_0_14px_rgba(59,130,246,0.55)]">
                      <AnimatedNumber value={res?.annualSavings || 0} />
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <TrendingDown className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-lg tracking-tight">Auto-detect your debts</p>
                      <p className="text-sm text-muted-foreground">
                        Connect your bank to pull every balance and rate in one tap.
                      </p>
                    </div>
                  </div>
                  <PlaidLinkButton />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-border/40 bg-card/30 py-12">
        <div className="container mx-auto px-4 flex flex-wrap justify-center items-center gap-x-16 gap-y-6 text-foreground/70">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <Building className="h-6 w-6" /> PLAID
          </div>
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <CreditCard className="h-6 w-6" /> STRIPE
          </div>
          <div className="flex items-center gap-3 font-semibold text-base tracking-[0.25em] uppercase">
            <Lock className="h-5 w-5" /> 256-bit Encryption
          </div>
        </div>
      </section>
    </div>
  );
}
