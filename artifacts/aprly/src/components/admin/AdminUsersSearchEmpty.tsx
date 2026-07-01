import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";

export function AdminUsersSearchEmpty() {
  return (
    <div className="admin-users-search-empty">
      <img
        src={adminAsset("users/no-search.png")}
        alt=""
        className="max-w-[280px] w-full"
        aria-hidden="true"
      />
      <p className="app-text-p1-regular text-average">{adminContent.users.nothingFound}</p>
    </div>
  );
}
