import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AdminListPageHeaderProps = {
  title: string;
  icon: LucideIcon;
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
};

export function AdminListPageHeader({
  title,
  icon: Icon,
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  actions,
}: AdminListPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-7 w-7 shrink-0 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn("pl-9")}
            aria-label={searchPlaceholder}
          />
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
