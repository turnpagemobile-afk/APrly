import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";
import { cn } from "@/lib/utils";

type AdminUserSubscriptionCardProps = {
  active: boolean;
  programMonths: number;
  programEndDate: string | null;
};

export function AdminUserSubscriptionCard({
  active,
  programMonths,
  programEndDate,
}: AdminUserSubscriptionCardProps) {
  const copy = adminContent.userDetail;

  return (
    <section className="admin-user-subscription-card" aria-labelledby="admin-user-subscription-title">
      <header className="admin-user-subscription-header">
        <div className="admin-user-subscription-header-main">
          <img
            src={adminAsset("users/detail-checked.svg")}
            alt=""
            width={24}
            height={24}
            className="shrink-0"
            aria-hidden
          />
          <h2 id="admin-user-subscription-title" className="app-header-subheadline-bold text-average">
            {copy.subscriptionTitle}
          </h2>
        </div>
        <span
          className={cn(
            "admin-user-subscription-badge app-text-p2-bold",
            active
              ? "admin-user-subscription-badge--active"
              : "admin-user-subscription-badge--inactive",
          )}
        >
          <span className="admin-user-subscription-badge-dot" aria-hidden />
          {active ? copy.subscriptionActive : copy.subscriptionInactive}
        </span>
      </header>

      <p className="admin-user-subscription-footer app-text-p1-regular">
        {active && programEndDate
          ? copy.subscriptionProgramEnd(programMonths, programEndDate)
          : "—"}
      </p>
    </section>
  );
}
