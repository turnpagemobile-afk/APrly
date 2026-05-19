import { useMemo, type Dispatch, type SetStateAction } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Landmark, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CardEntryList } from "@/components/cards/CardEntryList";
import { usePlaidCardImport } from "@/components/cards/usePlaidCardImport";
import type { CardEntry } from "./types";
import { accountsAreComplete } from "./optimizerAccounts";

export interface OptimizerStep2Props {
  accounts: CardEntry[];
  setAccounts: Dispatch<SetStateAction<CardEntry[]>>;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function OptimizerStep2({
  accounts,
  setAccounts,
  name,
  setName,
  email,
  setEmail,
  onBack,
  onNext,
}: OptimizerStep2Props) {
  const { startPlaid, plaidBusy } = usePlaidCardImport(setAccounts);

  const add = () =>
    setAccounts([...accounts, { brand: "", balance: "", rate: "" }]);

  const cardsReady = useMemo(() => accountsAreComplete(accounts), [accounts]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div className="space-y-5">
        <CardEntryList
          accounts={accounts}
          setAccounts={setAccounts}
          brandLabel="Card Brand"
          balanceLabel="Balance ($)"
          rateLabel="Rate (%)"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={add}
            className="h-12 border-dashed border-border/60 font-bold hover:border-primary hover:text-primary"
          >
            <Plus className="mr-2 h-4 w-4" /> Add another card
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => void startPlaid()}
            disabled={plaidBusy}
            className="h-12 border-dashed border-border/60 font-bold hover:border-primary hover:text-primary"
          >
            <Landmark className="mr-2 h-4 w-4" /> Add cards from banks
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border/50">
        <CardContent className="p-6 space-y-4">
          <p className="font-black text-lg tracking-tight">
            Where should we send your plan?
          </p>
          <div className="grid grid-cols-1 cabinet:grid-cols-2 gap-4">
            <Input
              placeholder="First Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-background border-border/60"
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-background border-border/60"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button variant="ghost" onClick={onBack} className="font-bold">
          <ChevronLeft className="mr-1 h-5 w-5" /> Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!cardsReady}
          className="font-black uppercase tracking-wider text-base px-8 h-14 shadow-[0_0_18px_rgba(59,130,246,0.55)] hover:shadow-[0_0_24px_rgba(59,130,246,0.8)] transition-shadow disabled:opacity-40 disabled:shadow-none"
        >
          See My Plan <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
