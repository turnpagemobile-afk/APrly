import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";

type AdminPlanLeadDetailHeaderProps = {
  backHref: string;
  title: string;
  printPending?: boolean;
  printDisabled?: boolean;
  onPrint: () => void;
};

export function AdminPlanLeadDetailHeader({
  backHref,
  title,
  printPending = false,
  printDisabled = false,
  onPrint,
}: AdminPlanLeadDetailHeaderProps) {
  const copy = adminContent.adminPlanDetail;

  return (
    <header className="admin-plan-detail-header">
      <Link href={backHref} className="admin-plan-detail-back" aria-label={copy.backAria}>
        <img
          src={adminAsset("plans/arrow-right.svg")}
          alt=""
          width={44}
          height={44}
          className="admin-plan-detail-back-icon"
          aria-hidden
        />
        <h1 className="app-header-screen-title-bold min-w-0 truncate text-average">{title}</h1>
      </Link>
      <button
        type="button"
        className="admin-plan-detail-print-btn"
        aria-label={copy.printAria}
        disabled={printPending || printDisabled}
        onClick={onPrint}
      >
        {printPending ? (
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        ) : (
          <img
            src={adminAsset("users/detail-print.svg")}
            alt=""
            width={24}
            height={24}
            aria-hidden
          />
        )}
      </button>
    </header>
  );
}

export function adminPlanDetailTitle(planId: number): string {
  return adminContent.adminPlanDetail.planDetailTitle(planId);
}
