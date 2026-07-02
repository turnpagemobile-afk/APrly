import { Link } from "wouter";
import { adminContent } from "@/content/admin";
import { cn } from "@/lib/utils";

type AdminUserDetailBreadcrumbsProps = {
  userName: string;
};

export function AdminUserDetailBreadcrumbs({ userName }: AdminUserDetailBreadcrumbsProps) {
  const copy = adminContent.userDetail;

  return (
    <nav className="admin-user-breadcrumb" aria-label="Breadcrumb">
      <Link
        href="/admin/users"
        className={cn("admin-user-breadcrumb-link app-button-button-l-m text-action")}
      >
        {copy.breadcrumbMembers}
      </Link>
      <span
        className="admin-user-breadcrumb-separator app-text-p1-regular text-average"
        aria-hidden
      >
        /
      </span>
      <span className={cn("admin-user-breadcrumb-current app-text-p1-bold text-average")}>
        {userName}
      </span>
    </nav>
  );
}
