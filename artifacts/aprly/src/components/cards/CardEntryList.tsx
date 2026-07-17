import type { Dispatch, SetStateAction } from "react";
import { CreditCard, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { CardEntry } from "@/components/landing/types";

type CardEntryListProps = {
  accounts: CardEntry[];
  setAccounts: Dispatch<SetStateAction<CardEntry[]>>;
  brandLabel?: string;
  balanceLabel?: string;
  rateLabel?: string;
};

export function CardEntryList({
  accounts,
  setAccounts,
  brandLabel = "Card brand",
  balanceLabel = "Balance",
  rateLabel = "Rate",
}: CardEntryListProps) {
  const update = (i: number, patch: Partial<CardEntry>) => {
    setAccounts(accounts.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  };

  const remove = (i: number) => {
    setAccounts(accounts.filter((_, idx) => idx !== i));
  };

  if (!accounts.length) return null;

  return (
    <div className="space-y-4">
      {accounts.map((acc, i) => (
        <Card key={acc.accountId ?? `card-${i}`} className="border-border/50 bg-card">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <p className="text-lg font-black">Card {i + 1}</p>
              </div>
              {accounts.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(i)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove card ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold tracking-wide text-muted-foreground">
                {brandLabel}
              </Label>
              <Input
                placeholder="Enter your card brand"
                value={acc.brand}
                onChange={(e) => update(i, { brand: e.target.value })}
                className="h-12 border-border/60 bg-background"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 cabinet:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold tracking-wide text-muted-foreground">
                  {balanceLabel}
                </Label>
                <Input
                  type="number"
                  placeholder="15000"
                  value={acc.balance}
                  onChange={(e) => update(i, { balance: e.target.value })}
                  className="h-12 border-border/60 bg-background font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold tracking-wide text-muted-foreground">
                  {rateLabel}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="24.99"
                  value={acc.rate}
                  onChange={(e) => update(i, { rate: e.target.value })}
                  className="h-12 border-border/60 bg-background font-bold"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
