import { cn } from "@/lib/utils";

type OptimizerStepPillsProps = {
  step: 1 | 2 | 3;
};

export function OptimizerStepPills({ step }: OptimizerStepPillsProps) {
  return (
    <div
      className="mt-5 flex gap-2 bp600:mt-6"
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={3}
      aria-label={`Step ${step} of 3`}
    >
      {([1, 2, 3] as const).map((i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors duration-300",
            "max-w-[4.5rem] bp600:max-w-[5.5rem]",
            i <= step
              ? "bg-[var(--secondary-theme-500)]"
              : "bg-[var(--primary-theme-200)]",
          )}
        />
      ))}
    </div>
  );
}
