import { adminContent } from "@/content/admin";
import { cn } from "@/lib/utils";

type AdminPartnerStatusCardProps = {
  active: boolean;
};

export function AdminPartnerStatusCard({ active }: AdminPartnerStatusCardProps) {
  const copy = adminContent.partnerDetail;

  return (
    <section
      className={cn(
        "admin-partner-status-card",
        active ? "admin-partner-status-card--active" : "admin-partner-status-card--inactive",
      )}
      aria-label={copy.fieldStatus}
    >
      <div className="admin-partner-status-card-stack">
        <span
          className={cn(
            "admin-partner-status-badge app-text-p2-bold",
            active ? "admin-partner-status-badge--active" : "admin-partner-status-badge--inactive",
          )}
        >
          <span className="admin-partner-status-badge-dot" aria-hidden />
          {active ? copy.statusActive : copy.statusDeactivated}
        </span>
        <p className="app-text-p2-bold uppercase text-average">{copy.fieldStatus}</p>
      </div>
    </section>
  );
}
