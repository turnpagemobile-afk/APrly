import { cn } from "@/lib/utils";

export type AdminTabItem<T extends string> = {
  id: T;
  label: string;
};

type AdminTabBarProps<T extends string> = {
  tabs: AdminTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
};

export function AdminTabBar<T extends string>({ tabs, value, onChange }: AdminTabBarProps<T>) {
  return (
    <div className="admin-tab-bar" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={cn("admin-tab", value === tab.id && "admin-tab--active")}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
