import { cn } from "@/lib/utils";

export type AdminDetailTab = {
  id: string;
  label: string;
};

type AdminDetailTabsProps = {
  tabs: AdminDetailTab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

export function AdminDetailTabs({ tabs, activeId, onChange, className }: AdminDetailTabsProps) {
  return (
    <div className={cn("flex border-b border-border/60", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cn(
            "px-4 py-3 text-sm font-semibold transition-colors",
            activeId === tab.id
              ? "border-b-2 border-primary text-[var(--tabs-title-selected)]"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
