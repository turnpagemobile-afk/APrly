import { CreditCard, Handshake } from "lucide-react";
import type { PlanLeadDetail } from "@workspace/api-client-react";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { PlanLeadMetricsGrid } from "@/components/dashboard/plan-lead/PlanLeadMetricsGrid";
import { HardshipPortalStepper } from "@/components/dashboard/plan-lead/HardshipPortalStepper";

type PlanLeadProgressViewProps = {
  detail: PlanLeadDetail;
};

function formatSentDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PlanLeadProgressView({ detail }: PlanLeadProgressViewProps) {
  const copy = planLeadDetailContent.status;
  const statusLabel = detail.status === "won" ? copy.won : copy.inProgress;
  const sentLabel = detail.sentToPartnerAt
    ? planLeadDetailContent.partnerSent(formatSentDate(detail.sentToPartnerAt))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
          <CreditCard className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">{detail.brand}</h1>
        </div>
      </div>

      <section className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Status
        </p>
        <p className="mt-1 text-lg font-bold text-foreground">{statusLabel}</p>
        <p className="mt-2 text-sm text-muted-foreground">{copy.inProgressDescription}</p>
      </section>

      <PlanLeadMetricsGrid detail={detail} />

      {detail.partner ? (
        <article className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Handshake className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-foreground">{detail.partner.name}</p>
              {sentLabel ? (
                <p className="mt-1 text-sm text-muted-foreground">{sentLabel}</p>
              ) : null}
            </div>
          </div>
        </article>
      ) : null}

      {detail.hardshipPortal ? (
        <section>
          <h2 className="mb-4 text-sm font-bold text-foreground">
            {detail.hardshipPortal.stage}
          </h2>
          <HardshipPortalStepper portal={detail.hardshipPortal} />
        </section>
      ) : null}
    </div>
  );
}
