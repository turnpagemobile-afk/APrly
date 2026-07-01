import { Link } from "wouter";
import { adminContent } from "@/content/admin";
import { cn } from "@/lib/utils";

type AdminPlanDetailBreadcrumbsProps =
  | {
      kind: "user";
      userId: number;
      userName: string;
    }
  | {
      kind: "partner";
      partnerId: number;
      partnerName: string;
    };

export function AdminPlanDetailBreadcrumbs(props: AdminPlanDetailBreadcrumbsProps) {
  if (props.kind === "user") {
    const copy = adminContent.userDetail;
    return (
      <nav className="admin-plan-detail-breadcrumb" aria-label="Breadcrumb">
        <Link
          href="/admin/users"
          className={cn("admin-plan-detail-breadcrumb-link app-button-button-l-m text-action")}
        >
          {copy.breadcrumbMembers}
        </Link>
        <span
          className="admin-plan-detail-breadcrumb-separator app-text-p1-regular text-average"
          aria-hidden
        >
          /
        </span>
        <Link
          href={`/admin/users/${props.userId}`}
          className={cn("admin-plan-detail-breadcrumb-current app-text-p1-bold text-average")}
        >
          {props.userName}
        </Link>
      </nav>
    );
  }

  const copy = adminContent.partnerDetail;
  return (
    <nav className="admin-plan-detail-breadcrumb" aria-label="Breadcrumb">
      <Link
        href="/admin/partners"
        className={cn("admin-plan-detail-breadcrumb-link app-button-button-l-m text-action")}
      >
        {copy.breadcrumbPartners}
      </Link>
      <span
        className="admin-plan-detail-breadcrumb-separator app-text-p1-regular text-average"
        aria-hidden
      >
        /
      </span>
      <Link
        href={`/admin/partners/${props.partnerId}`}
        className={cn("admin-plan-detail-breadcrumb-current app-text-p1-bold text-average")}
      >
        {props.partnerName}
      </Link>
    </nav>
  );
}
