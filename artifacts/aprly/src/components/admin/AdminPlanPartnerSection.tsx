import { Link } from "wouter";
import type { AdminPlanLeadDetailResponse } from "@workspace/api-client-react";
import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";
import { cn } from "@/lib/utils";

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
    <article className="admin-plan-detail-partner">
      <img
        src={adminAsset("plans/label-icon.svg")}
        alt=""
        width={44}
        height={44}
        className="admin-plan-detail-partner-icon"
        aria-hidden
      />
      <div className="admin-plan-detail-partner-content min-w-0 flex-1">
        <p className="app-header-screen-title-bold text-average">
          {copy.partnerNameTitle(partner.name, partner.id)}
        </p>
        {sentText ? (
          <p className="mt-1 app-text-p1-regular text-average">{sentText}</p>
        ) : null}
      </div>
      {detail.canStartWorking ? (
        <div className="admin-plan-detail-partner-actions">
          <button
            type="button"
            className={cn("admin-plan-detail-btn admin-plan-detail-btn--primary app-button-button-l-m")}
            disabled={isStarting || isRejecting}
            onClick={onStartWorking}
          >
            {copy.startWorking}
          </button>
          {detail.canReject ? (
            <button
              type="button"
              className={cn("admin-plan-detail-btn admin-plan-detail-btn--danger app-button-button-l-m")}
              disabled={isStarting || isRejecting}
              onClick={onReject}
            >
              {copy.reject}
            </button>
          ) : null}
        </div>
      ) : null}
      <Link
        href={`/admin/partners/${partner.id}`}
        className="admin-plan-detail-partner-link"
        aria-label={copy.openPartnerAria}
      >
        <img
          src={adminAsset("plans/arrow-link.svg")}
          alt=""
          width={24}
          height={24}
          aria-hidden
        />
      </Link>
    </article>
  );
}
