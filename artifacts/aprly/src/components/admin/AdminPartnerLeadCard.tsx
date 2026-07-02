import { Link } from "wouter";
import type { AdminPartnerPlanLead } from "@workspace/api-client-react";
import { AdminPlanLeadListCard } from "@/components/admin/AdminPlanLeadListCard";
import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";
import { openAdminPlanLeadPdf } from "@/lib/admin-plan-lead-pdf";
import { toast } from "@/hooks/use-toast";

type AdminPartnerLeadCardProps = {
  lead: AdminPartnerPlanLead;
  partnerId: number;
  tab: string;
};

export function AdminPartnerLeadCard({ lead, partnerId, tab }: AdminPartnerLeadCardProps) {
  const copy = adminContent.adminPlanDetail;
  const userDetailCopy = adminContent.userDetail;
  const href = `/admin/partners/${partnerId}/leads/${lead.id}?tab=${encodeURIComponent(tab)}`;

  const onPrint = async () => {
    try {
      await openAdminPlanLeadPdf(lead.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      toast({
        title: message === "Popup blocked" ? copy.printPopupBlocked : copy.printError,
        description: message === "Popup blocked" ? undefined : copy.printErrorDescription,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminPlanLeadListCard
      title={lead.brand}
      displayStatus={lead.displayStatus}
      hardshipPortal={lead.hardshipPortal}
      cards={lead.cards}
      balance={lead.balance}
      currentApr={lead.currentApr}
      targetApr={lead.targetApr}
      estimatedAnnualSavings={lead.estimatedAnnualSavings}
      detailHref={href}
      detailAriaLabel={lead.brand}
      actions={
        <>
          <button
            type="button"
            className="admin-user-plan-action-btn"
            aria-label={userDetailCopy.printPlanAria}
            onClick={() => void onPrint()}
          >
            <img
              src={adminAsset("users/detail-print.svg")}
              alt=""
              width={24}
              height={24}
              aria-hidden
            />
          </button>
          <Link href={href} className="admin-user-plan-action-btn" aria-label={lead.brand}>
            <img
              src={adminAsset("users/detail-arrow.svg")}
              alt=""
              width={24}
              height={24}
              aria-hidden
            />
          </Link>
        </>
      }
    />
  );
}
