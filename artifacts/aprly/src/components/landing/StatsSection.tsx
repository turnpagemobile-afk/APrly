import { statsContent } from "@/content/landing";
import { cn } from "@/lib/utils";

const SECTION_BG = "bg-[var(--palette-secondary-secondary-500)]";
const CIRCLE_BG = "bg-[var(--palette-secondary-secondary-400)]";

const circleSizeClass = cn(
  "size-[260px]",
  "bp600:size-[240px]",
  "bp840:size-[260px]",
  "bp1200:size-[300px]",
  "bp1600:size-[320px]",
);

const circleValueClass = cn(
  "font-[family-name:var(--app-font-hero-display)]",
  "text-[69px] font-semibold leading-[1.1] tracking-normal uppercase",
  "text-neutral-000",
);

const circleLabelClass = cn(
  "font-[family-name:var(--app-font-hero-body)]",
  "text-[22px] font-medium leading-[1.3] tracking-[-0.02em]",
  "text-center text-neutral-000",
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
          CIRCLE_BG,
          circleSizeClass,
        )}
      >
        <span className={circleValueClass}>{item.value}</span>
      </div>
      <p className={cn(circleLabelClass, "mt-6 max-w-[16rem] bp840:max-w-none")}>
        {item.label}
      </p>
    </div>
  );
}

export function StatsSection() {
  return (
    <section
      className={cn(
        SECTION_BG,
        "px-4 py-12 bp600:py-14 bp840:py-16 bp1200:py-20",
      )}
    >
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
