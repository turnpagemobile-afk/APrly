import { Link } from "wouter";
import type { AdminUserPlanLeadRow } from "@workspace/api-client-react";
import { AdminPlanLeadListCard } from "@/components/admin/AdminPlanLeadListCard";
import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";
import { toast } from "@/hooks/use-toast";

type AdminUserPlanCardProps = {
  plan: AdminUserPlanLeadRow;
  userId: number;
  planIndex: number;
};

export function AdminUserPlanCard({ plan, userId, planIndex }: AdminUserPlanCardProps) {
  const copy = adminContent.userDetail;
  const detailHref = `/admin/users/${userId}/plans/${plan.id}?planIndex=${planIndex}`;
  const title = copy.planCardTitle(planIndex);

  const onPrint = () => {
    toast({
      title: copy.printComingSoon,
      description: copy.printComingSoonDescription,
    });
  };

  return (
    <AdminPlanLeadListCard
      title={title}
      displayStatus={plan.displayStatus}
      hardshipPortal={plan.hardshipPortal}
      cards={plan.cards}
      balance={plan.balance}
      currentApr={plan.currentApr}
      targetApr={plan.targetApr}
      estimatedAnnualSavings={plan.estimatedAnnualSavings}
      detailHref={detailHref}
      detailAriaLabel={title}
      actions={
        <>
          <button
            type="button"
            className="admin-user-plan-action-btn"
            aria-label={copy.printPlanAria}
            onClick={onPrint}
          >
            <img
              src={adminAsset("users/detail-print.svg")}
              alt=""
              width={24}
              height={24}
              aria-hidden
            />
          </button>
          <Link
            href={detailHref}
            className="admin-user-plan-action-btn"
            aria-label={title}
          >
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
