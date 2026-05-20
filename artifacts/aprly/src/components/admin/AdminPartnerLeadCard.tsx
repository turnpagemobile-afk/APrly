import { ChevronRight, CreditCard } from "lucide-react";
import { Link } from "wouter";
import type { AdminPartnerPlanLead } from "@workspace/api-client-react";
import { adminContent } from "@/content/admin";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

type AdminPartnerLeadCardProps = {
  lead: AdminPartnerPlanLead;
  partnerId: number;
  tab: string;
};

function formatUserName(first?: string | null, last?: string | null) {
  const a = (first ?? "").trim();
  const b = (last ?? "").trim();
  return `${a} ${b}`.trim() || "—";
}

function statusLabel(displayStatus: AdminPartnerPlanLead["displayStatus"]) {
  const copy = adminContent.userDetail.planDisplayStatus;
  switch (displayStatus) {
    case "not_sent":
      return copy.notSent;
    case "on_review":
      return copy.onReview;
    case "in_progress":
      return copy.inProgress;
    case "won":
      return copy.won;
    case "rejected":
      return copy.rejected;
    default:
      return displayStatus;
  }
}

export function AdminPartnerLeadCard({ lead, partnerId, tab }: AdminPartnerLeadCardProps) {
  const href = `/admin/partners/${partnerId}/leads/${lead.id}?tab=${encodeURIComponent(tab)}`;
  const userLabel = formatUserName(lead.firstName, lead.lastName);
  const subtitle =
    userLabel !== "—" ? `${userLabel} · ${lead.userEmail}` : lead.userEmail;

  return (
    <article className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold text-primary">{lead.brand}</h3>
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {statusLabel(lead.displayStatus)}
          </span>
          <Link
            href={href}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md text-primary",
              "hover:bg-muted",
            )}
            aria-label={lead.brand}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <p className="mt-4 text-center text-2xl font-bold tracking-tight text-foreground">
        {formatCurrency(lead.balance, 2)}
      </p>

      <p className="mt-3 text-center text-sm text-muted-foreground">
        {adminContent.userDetail.estimatedSavings}{" "}
        <span className="font-semibold text-foreground">
          {formatCurrency(lead.estimatedAnnualSavings)}
          {adminContent.userDetail.perYear}
        </span>
      </p>
    </article>
  );
}
