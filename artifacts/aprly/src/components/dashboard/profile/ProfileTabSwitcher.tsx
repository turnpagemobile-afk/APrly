import { cn } from "@/lib/utils";
import { dashboardProfileContent } from "@/content/dashboard-profile";

export type ProfileSection = "profile" | "password";

type ProfileTabSwitcherProps = {
  active: ProfileSection;
  onChange: (section: ProfileSection) => void;
};

export function ProfileTabSwitcher({ active, onChange }: ProfileTabSwitcherProps) {
  const copy = dashboardProfileContent.tabs;

  return (
    <div
      className="inline-flex w-full max-w-md rounded-full border-2 border-primary p-1"
      role="tablist"
      aria-label="Profile sections"
    >
      {(
        [
          { id: "profile" as const, label: copy.profile },
          { id: "password" as const, label: copy.password },
        ] as const
      ).map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-primary hover:bg-muted/40",
            )}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
