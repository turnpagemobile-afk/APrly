import { ChevronRight, Printer } from "lucide-react";
import { Link } from "wouter";
import type { AdminUserPlanLeadRow } from "@workspace/api-client-react";
import { AdminPlanLeadListCard } from "@/components/admin/AdminPlanLeadListCard";
import { adminContent } from "@/content/admin";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type AdminUserPlanCardProps = {
  plan: AdminUserPlanLeadRow;
  userId: number;
  planIndex: number;
};

export function AdminUserPlanCard({ plan, userId, planIndex }: AdminUserPlanCardProps) {
  const copy = adminContent.userDetail;
  const detailHref = `/admin/users/${userId}/plans/${plan.id}?planIndex=${planIndex}`;
  const title = `${dashboardTabContent.planCard.planLabel} #${planIndex}`;

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
      cards={plan.cards}
      balance={plan.balance}
      currentApr={plan.currentApr}
      targetApr={plan.targetApr}
      estimatedAnnualSavings={plan.estimatedAnnualSavings}
      detailHref={detailHref}
      detailAriaLabel={title}
      actions={
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            aria-label={copy.printPlanAria}
            onClick={onPrint}
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-primary" asChild>
            <Link href={detailHref} aria-label={plan.brand}>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </Button>
        </>
      }
    />
  );
}
