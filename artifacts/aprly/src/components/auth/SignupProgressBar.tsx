import { cn } from "@/lib/utils";

type SignupProgressBarProps = {
  /** 1 = signup, 2 = profile (both segments filled when 2) */
  currentStep: 1 | 2;
};

export function SignupProgressBar({ currentStep }: SignupProgressBarProps) {
  return (
    <div className="mt-4 flex gap-2" aria-hidden>
      {[1, 2].map((segment) => (
        <div
          key={segment}
          className={cn(
            "h-1 flex-1 rounded-full",
            currentStep >= segment
              ? "bg-[var(--progressbar-selected-color)]"
              : "bg-[var(--progressbar-default-color)]",
          )}
        />
      ))}
    </div>
  );
}
