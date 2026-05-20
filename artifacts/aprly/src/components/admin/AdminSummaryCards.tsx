import { cn } from "@/lib/utils";

export type AdminSummaryCard = {
  value: string | number;
  label: string;
};

type AdminSummaryCardsProps = {
  cards: AdminSummaryCard[];
  className?: string;
};

export function AdminSummaryCards({ cards, className }: AdminSummaryCardsProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border/60 bg-card px-6 py-5 shadow-sm"
        >
          <p className="text-3xl font-bold text-foreground">{card.value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
