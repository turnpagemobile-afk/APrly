import { useState } from "react";
import { Handshake, Loader2 } from "lucide-react";
import type { Partner } from "@workspace/api-client-react";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlanLeadPartnerListProps = {
  partners: Partner[];
  isSending: boolean;
  onSend: (partnerId: number) => void;
};

export function PlanLeadPartnerList({
  partners,
  isSending,
  onSend,
}: PlanLeadPartnerListProps) {
  const [selectedId, setSelectedId] = useState<number | null>(
    partners[0]?.id ?? null,
  );

  if (partners.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No partners are available yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-foreground">
        {planLeadDetailContent.selectPartner}
      </h2>
      <ul className="space-y-3">
        {partners.map((partner) => {
          const selected = selectedId === partner.id;
          return (
            <li key={partner.id}>
              <article
                className={cn(
                  "rounded-lg border bg-card p-4 shadow-sm transition-colors",
                  selected ? "border-primary ring-1 ring-primary/30" : "border-border/60",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => setSelectedId(partner.id)}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                      <Handshake className="h-5 w-5 text-primary" aria-hidden="true" />
                    </span>
                    <span className="truncate font-bold text-foreground">{partner.name}</span>
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0 font-semibold"
                    disabled={!selected || isSending}
                    onClick={() => onSend(partner.id)}
                  >
                    {isSending && selected ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      planLeadDetailContent.sendInfo
                    )}
                  </Button>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
