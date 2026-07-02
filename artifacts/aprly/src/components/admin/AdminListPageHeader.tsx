import type { ReactNode } from "react";
import { AdminNavIcon, type AdminNavIconName } from "@/components/admin/AdminNavIcon";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";

type AdminListPageHeaderProps = {
  title: string;
  icon: AdminNavIconName;
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
};

export function AdminListPageHeader({
  title,
  icon,
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  actions,
}: AdminListPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="admin-page-title-icon">
          <AdminNavIcon name={icon} className="h-5 w-5 text-[var(--primary-theme-950)]" />
        </span>
        <h1 className="app-header-h6 text-average">{title}</h1>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <AdminSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
