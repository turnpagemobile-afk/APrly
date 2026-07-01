import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";

type AdminUserInfoCardProps = {
  userId: number;
  registrationDate: string;
  email: string;
};

export function AdminUserInfoCard({ userId, registrationDate, email }: AdminUserInfoCardProps) {
  const copy = adminContent.userDetail;

  return (
    <section className="admin-user-info-card" aria-labelledby="admin-user-info-title">
      <header className="admin-user-info-header">
        <div className="admin-user-info-header-main">
          <img
            src={adminAsset("users/detail-heroicon.svg")}
            alt=""
            width={24}
            height={24}
            className="shrink-0"
            aria-hidden
          />
          <h2 id="admin-user-info-title" className="app-header-subheadline-bold text-average">
            {copy.userInfoTitle}
          </h2>
        </div>
        <span className="admin-user-info-id app-text-p1-regular">{copy.fieldIdPrefix(userId)}</span>
      </header>

      <div className="admin-user-info-fields">
        <div>
          <p className="admin-user-info-field-label app-text-p2-regular">
            {copy.fieldRegistrationDate}
          </p>
          <p className="app-text-p1-regular text-average">{registrationDate}</p>
        </div>
        <div>
          <p className="admin-user-info-field-label app-text-p2-regular">{copy.fieldEmail}</p>
          <p className="app-text-p1-regular text-average break-all">{email}</p>
        </div>
      </div>
    </section>
  );
}
