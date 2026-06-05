import { Building2, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { AdminPlanLeadDetailResponse } from "@workspace/api-client-react";
import { adminContent } from "@/content/admin";
import { Button } from "@/components/ui/button";

type AdminPlanPartnerSectionProps = {
  detail: AdminPlanLeadDetailResponse;
  onStartWorking: () => void;
  onReject: () => void;
  isStarting?: boolean;
  isRejecting?: boolean;
};

function formatSentDate(value: string | Date) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function AdminPlanPartnerSection({
  detail,
  onStartWorking,
  onReject,
  isStarting,
  isRejecting,
}: AdminPlanPartnerSectionProps) {
  const copy = adminContent.adminPlanDetail;
  const partner = detail.partner;

  if (!partner) return null;

  const sentText = detail.sentToPartnerAt
    ? copy.partnerSent(formatSentDate(detail.sentToPartnerAt))
    : null;

  return (
    <div className="space-y-4">
      <article className="dash-plan-detail-partner">
        <span className="dash-plan-detail-partner-icon" aria-hidden="true">
          <Building2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="dash-plan-detail-partner-name">{partner.name}</p>
          {sentText ? <p className="dash-plan-detail-partner-meta">{sentText}</p> : null}
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" asChild>
          <Link href={`/admin/partners/${partner.id}`} aria-label={copy.openPartnerAria}>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </Button>
      </article>

      {detail.canStartWorking ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isStarting || isRejecting}
            onClick={onStartWorking}
          >
            {copy.startWorking}
          </Button>
          {detail.canReject ? (
            <Button
              type="button"
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              disabled={isStarting || isRejecting}
              onClick={onReject}
            >
              {copy.reject}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
