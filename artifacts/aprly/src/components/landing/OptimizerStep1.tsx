import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

function BigArrow() {
  return (
    <motion.div
      animate={{ x: [0, 12, 0] }}
      transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
      className="hidden cabinet:flex items-center text-primary drop-shadow-[0_0_18px_rgba(56,189,248,0.7)] shrink-0"
      aria-hidden
    >
      <ArrowRight className="h-16 w-16 cabinet:h-20 cabinet:w-20" strokeWidth={3} />
    </motion.div>
  );
}

export interface OptimizerStep1Props {
  totalDebt: string;
  setTotalDebt: (v: string) => void;
  interestRate: string;
  setInterestRate: (v: string) => void;
  onNext: () => void;
}

export function OptimizerStep1({
  totalDebt,
  setTotalDebt,
  interestRate,
  setInterestRate,
  onNext,
}: OptimizerStep1Props) {
  const ready =
    !!totalDebt &&
    !!interestRate &&
    parseFloat(totalDebt) > 0 &&
    parseFloat(interestRate) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="space-y-10"
    >
      <div className="flex items-center gap-6 cabinet:gap-10">
        <BigArrow />
        <Card className="bg-card border-border/50 flex-1">
          <CardContent className="p-6 cabinet:p-8 space-y-3">
            <Label
              htmlFor="debt"
              className="text-base cabinet:text-lg font-black uppercase tracking-[0.18em] text-primary"
            >
              Enter your debt in dollars
            </Label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl cabinet:text-4xl font-black text-muted-foreground">
                $
              </span>
              <Input
                id="debt"
                type="number"
                inputMode="decimal"
                placeholder="15000"
                value={totalDebt}
                onChange={(e) => setTotalDebt(e.target.value)}
                autoFocus
                className="text-3xl cabinet:text-4xl h-20 cabinet:h-24 pl-12 cabinet:pl-14 font-black bg-background border-border/60 focus-visible:ring-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-6 cabinet:gap-10">
        <BigArrow />
        <Card className="bg-card border-border/50 flex-1">
          <CardContent className="p-6 cabinet:p-8 space-y-3">
            <Label
              htmlFor="rate"
              className="text-base cabinet:text-lg font-black uppercase tracking-[0.18em] text-primary"
            >
              Enter the interest rate you're paying
            </Label>
            <div className="relative">
              <Input
                id="rate"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="24.99"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="text-3xl cabinet:text-4xl h-20 cabinet:h-24 pr-14 font-black bg-background border-border/60 focus-visible:ring-primary"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-3xl cabinet:text-4xl font-black text-muted-foreground">
                %
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!ready}
          className="font-black uppercase tracking-wider text-base px-8 h-14 shadow-[0_0_18px_rgba(59,130,246,0.55)] hover:shadow-[0_0_24px_rgba(59,130,246,0.8)] transition-shadow disabled:opacity-40 disabled:shadow-none"
        >
          Continue <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
