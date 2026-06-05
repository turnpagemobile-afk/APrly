import { Link } from "wouter";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { dashboardTabContent } from "@/content/dashboard-tab";
import { adminContent } from "@/content/admin";
import { Button } from "@/components/ui/button";

type AdminPlanLeadDetailHeaderProps = {
  backHref: string;
  title: string;
  subtitle?: string | null;
  printPending?: boolean;
  printDisabled?: boolean;
  onPrint: () => void;
};

export function AdminPlanLeadDetailHeader({
  backHref,
  title,
  subtitle,
  printPending = false,
  printDisabled = false,
  onPrint,
}: AdminPlanLeadDetailHeaderProps) {
  const copy = adminContent.adminPlanDetail;

  return (
    <header className="dash-plan-detail-header">
      <Link href={backHref} className="dash-plan-detail-back">
        <ArrowLeft className="dash-plan-detail-back-icon" aria-hidden="true" />
        <div className="min-w-0">
          <h1 className="dash-plan-detail-title">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm font-normal normal-case tracking-normal text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-primary"
        aria-label={copy.printAria}
        disabled={printPending || printDisabled}
        onClick={onPrint}
      >
        {printPending ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <Printer className="h-5 w-5" />
        )}
      </Button>
    </header>
  );
}

export function adminPlanDetailTitle(planIndex: number | null, brand: string): string {
  if (planIndex != null && planIndex > 0) {
    return `${dashboardTabContent.planCard.planLabel} #${planIndex}`;
  }
  return brand;
}
