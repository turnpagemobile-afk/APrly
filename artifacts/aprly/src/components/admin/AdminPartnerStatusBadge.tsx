import { adminContent } from "@/content/admin";
import { cn } from "@/lib/utils";

type AdminPartnerStatusBadgeProps = {
  isActive: boolean;
};

export function AdminPartnerStatusBadge({ isActive }: AdminPartnerStatusBadgeProps) {
  return (
    <span
      className={cn(
        "admin-partner-status-badge",
        isActive ? "admin-partner-status-badge--active" : "admin-partner-status-badge--deactivated",
      )}
    >
      {isActive ? adminContent.partners.active : adminContent.partners.deactivated}
    </span>
  );
}
