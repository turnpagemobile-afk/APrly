import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { AdminPartnerPlanLead } from "@workspace/api-client-react";
import { AdminPlanLeadListCard } from "@/components/admin/AdminPlanLeadListCard";
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

export function AdminPartnerLeadCard({ lead, partnerId, tab }: AdminPartnerLeadCardProps) {
  const href = `/admin/partners/${partnerId}/leads/${lead.id}?tab=${encodeURIComponent(tab)}`;
  const userLabel = formatUserName(lead.firstName, lead.lastName);
  const subtitle =
    userLabel !== "—" ? `${userLabel} · ${lead.userEmail}` : lead.userEmail;

  return (
    <AdminPlanLeadListCard
      title={lead.brand}
      subtitle={subtitle}
      displayStatus={lead.displayStatus}
      cards={lead.cards}
      balance={lead.balance}
      currentApr={lead.currentApr}
      targetApr={lead.targetApr}
      estimatedAnnualSavings={lead.estimatedAnnualSavings}
      detailHref={href}
      detailAriaLabel={lead.brand}
      actions={
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
      }
    />
  );
}
