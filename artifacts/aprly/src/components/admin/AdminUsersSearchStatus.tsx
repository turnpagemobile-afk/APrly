import { adminContent } from "@/content/admin";

type AdminUsersSearchStatusProps = {
  message: string;
  onClear: () => void;
};

export function AdminUsersSearchStatus({ message, onClear }: AdminUsersSearchStatusProps) {
  return (
    <div className="admin-users-search-status">
      <p className="app-header-screen-title text-average">{message}</p>
      <button
        type="button"
        className="admin-users-search-clear-btn app-button-button-l-m text-action"
        onClick={onClear}
      >
        {adminContent.users.clearSearch}
      </button>
    </div>
  );
}
