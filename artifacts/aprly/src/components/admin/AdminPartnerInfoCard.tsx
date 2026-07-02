import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";

type AdminPartnerInfoCardProps = {
  partnerId: number;
  createdOn: string;
  companyName: string;
  email: string;
};

export function AdminPartnerInfoCard({
  partnerId,
  createdOn,
  companyName,
  email,
}: AdminPartnerInfoCardProps) {
  const copy = adminContent.partnerDetail;

  return (
    <section className="admin-partner-info-card" aria-labelledby="admin-partner-info-title">
      <header className="admin-partner-info-header">
        <div className="admin-partner-info-header-main">
          <img
            src={adminAsset("users/detail-heroicon.svg")}
            alt=""
            width={24}
            height={24}
            className="shrink-0"
            aria-hidden
          />
          <h2 id="admin-partner-info-title" className="app-header-subheadline-bold text-average">
            {copy.partnerInfoTitle}
          </h2>
        </div>
        <span className="admin-partner-info-id app-text-p1-regular">{copy.fieldIdPrefix(partnerId)}</span>
      </header>

      <div className="admin-partner-info-fields">
        <div>
          <p className="admin-partner-info-field-label app-text-p2-regular">{copy.fieldCreated}</p>
          <p className="app-text-p1-regular text-average">{createdOn}</p>
        </div>
        <div>
          <p className="admin-partner-info-field-label app-text-p2-regular">{copy.nameLabel}</p>
          <p className="app-text-p1-regular text-average">{companyName}</p>
        </div>
        <div>
          <p className="admin-partner-info-field-label app-text-p2-regular">{copy.fieldEmail}</p>
          <p className="app-text-p1-regular text-average break-all">{email}</p>
        </div>
      </div>
    </section>
  );
}
