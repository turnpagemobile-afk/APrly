import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "outline" | "solid";
  asChild?: boolean;
  size?: "sm" | "default" | "lg";
};

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ className, variant = "solid", asChild = false, size = "default", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wide transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-theme-500)] focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          size === "sm" ? "h-9 px-5 text-xs" : size === "lg" ? "h-12 px-8 text-sm" : "h-10 px-6 text-sm",
          variant === "outline"
            ? "border border-[var(--primary-theme-500)] bg-transparent text-[var(--primary-theme-500)] hover:bg-[var(--primary-theme-100)]"
            : "border border-transparent bg-[var(--primary-theme-500)] text-white hover:bg-[var(--primary-theme-600)]",
          className,
        )}
        {...props}
      />
    );
  },
);

PillButton.displayName = "PillButton";
