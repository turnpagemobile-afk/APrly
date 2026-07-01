import type { AdminPartnerPlanLead } from "@workspace/api-client-react";
import { AdminPartnerLeadCard } from "@/components/admin/AdminPartnerLeadCard";
import { adminAsset } from "@/lib/admin-assets";

type AdminPartnerLeadGroupProps = {
  userId: number;
  userName: string;
  userEmail: string;
  leads: AdminPartnerPlanLead[];
  partnerId: number;
  tab: string;
};

export function AdminPartnerLeadGroup({
  userName,
  userEmail,
  leads,
  partnerId,
  tab,
}: AdminPartnerLeadGroupProps) {
  return (
    <div className="admin-partner-lead-group">
      <div className="admin-partner-lead-group-rail" aria-hidden>
        <img
          src={adminAsset("users/user-icon.svg")}
          alt=""
          width={40}
          height={40}
          className="admin-partner-lead-group-user-icon"
        />
        <span className="admin-partner-lead-group-line" />
      </div>
      <div className="admin-partner-lead-group-content">
        <div className="admin-partner-lead-group-user">
          <p className="app-header-screen-title-bold text-average">{userName}</p>
          <p className="app-text-p1-regular text-average">{userEmail}</p>
        </div>
        <ul className="space-y-4">
          {leads.map((lead) => (
            <li key={lead.id}>
              <AdminPartnerLeadCard lead={lead} partnerId={partnerId} tab={tab} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
