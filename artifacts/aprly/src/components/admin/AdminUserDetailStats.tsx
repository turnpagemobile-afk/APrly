import { adminContent } from "@/content/admin";

type AdminUserDetailStatsProps = {
  monthsRegistered: number;
  savingPlansCount: number;
};

export function AdminUserDetailStats({
  monthsRegistered,
  savingPlansCount,
}: AdminUserDetailStatsProps) {
  const copy = adminContent.userDetail;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="admin-user-stat-card">
        <p className="admin-user-stat-value admin-user-stat-value--registered">
          {monthsRegistered} {copy.monthsUnit(monthsRegistered)}
        </p>
        <p className="admin-user-stat-label">{copy.registeredAgo}</p>
      </div>
      <div className="admin-user-stat-card">
        <p className="admin-user-stat-value admin-user-stat-value--plans">{savingPlansCount}</p>
        <p className="admin-user-stat-label">{copy.savingPlans}</p>
      </div>
    </div>
  );
}
