import { cn } from "@/lib/utils";

export type StepProgressPillsProps = {
  /** Number of steps (2 or 3). */
  totalSteps: 2 | 3;
  /** Current step, 1-based. */
  currentStep: number;
  className?: string;
  /** "audit" — Figma/Start Audit elongated active pill; "equal" — legacy equal segments */
  variant?: "audit" | "equal";
};

export function StepProgressPills({
  totalSteps,
  currentStep,
  className,
  variant = "audit",
}: StepProgressPillsProps) {
  return (
    <div
      className={cn(variant === "audit" ? "flex gap-[9px]" : "flex gap-2", className)}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep}
      aria-label={`Step ${currentStep} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, index) => index + 1).map((step) => (
        <div
          key={step}
          className={cn(
            "rounded-full",
            variant === "audit"
              ? cn(
                  "h-4 shrink-0 transition-[width,background-color] duration-300",
                  step === currentStep
                    ? "w-[72px] bg-[var(--success-theme-500)]"
                    : step < currentStep
                      ? "w-8 bg-[var(--primary-theme-200)]"
                      : "w-8 bg-[var(--neutral-theme-200)]",
                )
              : cn(
                  "h-1 flex-1",
                  currentStep >= step
                    ? "bg-[var(--primary-theme-500)]"
                    : "bg-[var(--neutral-theme-200)]",
                ),
          )}
        />
      ))}
    </div>
  );
}
