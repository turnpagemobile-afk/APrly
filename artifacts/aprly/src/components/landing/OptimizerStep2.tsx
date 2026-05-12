import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  CreditCard,
  Landmark,
  Plus,
  Trash2,
} from "lucide-react";
import type { PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import {
  useCreatePlaidLinkToken,
  useExchangePlaidPublicToken,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { CardEntry } from "./types";
import { accountsAreComplete } from "./optimizerAccounts";
import {
  createPlaidLink,
  destroyPlaidHandler,
  ensurePlaidScript,
  openPlaidLinkDeferred,
  type PlaidLinkHandler,
} from "./plaidLink";

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
  const { toast } = useToast();
  const linkHandlerRef = useRef<PlaidLinkHandler | null>(null);
  const plaidClickLockRef = useRef(false);
  const [plaidOpening, setPlaidOpening] = useState(false);

  const createLinkToken = useCreatePlaidLinkToken();
  const exchangeToken = useExchangePlaidPublicToken();

  useEffect(() => {
    return () => {
      plaidClickLockRef.current = false;
      destroyPlaidHandler(linkHandlerRef.current);
      linkHandlerRef.current = null;
    };
  }, []);

  const appendImported = useCallback(
    (rows: { brand: string; balance: number; rate: number; accountId?: string }[]) => {
      setAccounts((prev) => {
        const seen = new Set(
          prev.map((a) => a.accountId).filter((id): id is string => !!id),
        );
        const fresh = rows.filter((r) => !r.accountId || !seen.has(r.accountId));
        const mapped: CardEntry[] = fresh.map((r) => ({
          brand: r.brand,
          balance: String(r.balance),
          rate: String(r.rate),
          accountId: r.accountId,
        }));
        return [...prev, ...mapped];
      });
    },
    [setAccounts],
  );

  const runExchange = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      try {
        const result = await exchangeToken.mutateAsync({
          data: {
            publicToken,
            institutionName: metadata.institution?.name,
          },
        });
        appendImported(result.importedCards);
        if (!result.importedCards.length) {
          toast({
            title: "No card debt imported",
            description:
              "Plaid returned no credit-card balances with APR. Try another sandbox institution or add cards manually.",
          });
        }
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Could not load bank cards",
          description: e instanceof Error ? e.message : "Unknown error",
        });
      } finally {
        destroyPlaidHandler(linkHandlerRef.current);
        linkHandlerRef.current = null;
      }
    },
    [appendImported, exchangeToken, toast],
  );

  const update = (i: number, patch: Partial<CardEntry>) => {
    setAccounts(accounts.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  };
  const add = () =>
    setAccounts([...accounts, { brand: "", balance: "", rate: "" }]);
  const remove = (i: number) =>
    setAccounts(accounts.filter((_, idx) => idx !== i));

  const cardsReady = useMemo(() => accountsAreComplete(accounts), [accounts]);

  const startPlaid = async () => {
    if (plaidClickLockRef.current) {
      return;
    }
    plaidClickLockRef.current = true;
    setPlaidOpening(true);
    try {
      await ensurePlaidScript();

      destroyPlaidHandler(linkHandlerRef.current);
      linkHandlerRef.current = null;

      const { linkToken } = await createLinkToken.mutateAsync();
      const token = typeof linkToken === "string" ? linkToken.trim() : "";
      if (!token) {
        throw new Error("Empty link_token from API");
      }

      const handler = createPlaidLink({
        token,
        onSuccess: (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
          plaidClickLockRef.current = false;
          setPlaidOpening(false);
          void runExchange(publicToken, metadata);
        },
        onExit: () => {
          plaidClickLockRef.current = false;
          setPlaidOpening(false);
          destroyPlaidHandler(linkHandlerRef.current);
          linkHandlerRef.current = null;
        },
        onEvent: (eventName: string) => {
          if (eventName === "ERROR") {
            plaidClickLockRef.current = false;
            setPlaidOpening(false);
          }
        },
      });

      linkHandlerRef.current = handler;
      // Defer open() like plaid_link_test.html (create first, open on next task after user flow / await).
      openPlaidLinkDeferred(handler);
    } catch (e) {
      plaidClickLockRef.current = false;
      setPlaidOpening(false);
      destroyPlaidHandler(linkHandlerRef.current);
      linkHandlerRef.current = null;
      toast({
        variant: "destructive",
        title: "Plaid unavailable",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  const plaidBusy =
    plaidOpening || createLinkToken.isPending || exchangeToken.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div className="space-y-5">
        {accounts.map((acc, i) => (
          <Card key={acc.accountId ?? `card-${i}`} className="bg-card border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-black text-lg">Card {i + 1}</p>
                </div>
                {accounts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(i)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Card Brand
                  </Label>
                  <Input
                    placeholder="Chase Sapphire"
                    value={acc.brand}
                    onChange={(e) => update(i, { brand: e.target.value })}
                    className="h-12 bg-background border-border/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Balance ($)
                  </Label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={acc.balance}
                    onChange={(e) => update(i, { balance: e.target.value })}
                    className="h-12 font-bold bg-background border-border/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Rate (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="24.99"
                    value={acc.rate}
                    onChange={(e) => update(i, { rate: e.target.value })}
                    className="h-12 font-bold bg-background border-border/60"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={add}
            className="h-12 font-bold border-dashed border-border/60 hover:border-primary hover:text-primary"
          >
            <Plus className="mr-2 h-4 w-4" /> Add another card
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={startPlaid}
            disabled={plaidBusy}
            className="h-12 font-bold border-dashed border-border/60 hover:border-primary hover:text-primary"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
