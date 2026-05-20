import { ChevronRight, User } from "lucide-react";
import { Link } from "wouter";
import type { AdminPlanLeadDetailResponse } from "@workspace/api-client-react";
import { adminContent } from "@/content/admin";
import { Button } from "@/components/ui/button";

type AdminPlanPartnerBarProps = {
  detail: AdminPlanLeadDetailResponse;
  onStartWorking: () => void;
  onReject: () => void;
  isStarting?: boolean;
  isRejecting?: boolean;
};

function formatSentDate(value: string | Date) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminPlanPartnerBar({
  detail,
  onStartWorking,
  onReject,
  isStarting,
  isRejecting,
}: AdminPlanPartnerBarProps) {
  const copy = adminContent.adminPlanDetail;
  const partner = detail.partner;

  if (!partner) return null;

  const sentText = detail.sentToPartnerAt
    ? copy.partnerSent(formatSentDate(detail.sentToPartnerAt))
    : null;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <User className="h-5 w-5 text-primary" aria-hidden="true" />
        </span>
        <div>
          <p className="font-bold text-foreground">{partner.name}</p>
          {sentText ? <p className="mt-1 text-sm text-muted-foreground">{sentText}</p> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {detail.canStartWorking ? (
          <>
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
          </>
        ) : null}
        {detail.partner ? (
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9" asChild>
            <Link href={`/admin/partners/${partner.id}`} aria-label={copy.openPartnerAria}>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
