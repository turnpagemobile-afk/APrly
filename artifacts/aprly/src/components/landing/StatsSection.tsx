import { statsContent } from "@/content/landing";
import { cn } from "@/lib/utils";

const circleSizeClass = cn(
  "size-[260px]",
  "bp600:size-[240px]",
  "bp840:size-[260px]",
  "bp1200:size-[300px]",
  "bp1600:size-[320px]",
);

type StatItem = (typeof statsContent.items)[number];

function StatCircle({
  item,
  className,
}: {
  item: StatItem;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          "bg-[var(--neutral-theme-900)]",
          circleSizeClass,
        )}
      >
        <span className="app-header-h2 text-[var(--neutral-theme-000)]">
          {item.value}
        </span>
      </div>
      <p
        className={cn(
          "app-header-h6 text-average mt-6 max-w-[16rem] bp840:max-w-none",
        )}
      >
        {item.label}
      </p>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="bg-[var(--page-bg)] px-4 py-12 bp600:py-14 bp840:py-16 bp1200:py-20">
      <div className="app-page-marketing">
        <div
          className={cn(
            "grid justify-items-center",
            "grid-cols-1 gap-y-10",
            "bp600:grid-cols-2 bp600:gap-x-8 bp600:gap-y-12",
            "bp840:grid-cols-3 bp840:gap-x-10",
            "bp1200:gap-x-12",
          )}
        >
          {statsContent.items.map((item, index) => (
            <StatCircle
              key={item.id}
              item={item}
              className={cn(
                index === 2 &&
                  "bp600:col-span-2 bp600:justify-self-center bp840:col-span-1",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
