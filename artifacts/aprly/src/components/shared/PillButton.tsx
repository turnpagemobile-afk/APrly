import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type PillButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "destructiveSecondary"
  | "special"
  /** @deprecated Use `primary` */
  | "solid";

export type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PillButtonVariant;
  asChild?: boolean;
  size?: "sm" | "default" | "lg" | "xl" | "xxl";
};

const sizeClasses: Record<NonNullable<PillButtonProps["size"]>, string> = {
  sm: "h-9 px-5 app-button-button-s",
  default: "h-[52px] px-[14px] app-button-button-l-m",
  lg: "h-[52px] min-w-[167px] px-[14px] app-button-button-l-m",
  xl: "h-14 min-w-[200px] px-8 app-button-button-l-m",
  xxl: "h-[104px] w-[308px] max-w-full px-8 app-button-button-xxl",
};

const variantClasses: Record<Exclude<PillButtonVariant, "solid">, string> = {
  primary: cn(
    "border border-transparent bg-[var(--action-default-color)] text-[var(--neutral-theme-000)]",
    "hover:bg-[var(--success-theme-700)]",
    "focus-visible:shadow-[0_0_0_4px_var(--button-default-focus)]",
    "disabled:bg-[var(--button-disable-color)] disabled:text-[var(--neutral-theme-000)]",
  ),
  secondary: cn(
    "border-2 border-[var(--action-default-color)]",
    "bg-[var(--button-secondary-normal-bg-color)] text-[var(--action-default-color)]",
    "hover:border-[var(--success-theme-500)] hover:bg-[var(--button-secondary-hover-bg-color)] hover:text-[var(--success-theme-600)]",
    "focus-visible:shadow-[0_0_0_4px_var(--button-default-focus)]",
    "disabled:border-[var(--button-disable-color)] disabled:bg-[var(--button-disable-color)] disabled:text-[var(--neutral-theme-000)]",
  ),
  outline: cn(
    "border border-transparent bg-transparent text-[var(--action-default-color)]",
    "hover:bg-[var(--button-secondary-normal-bg-color)]",
    "focus-visible:shadow-[0_0_0_4px_var(--button-default-focus)]",
    "disabled:text-[var(--button-disable-color)]",
  ),
  ghost: cn(
    "border border-transparent bg-transparent text-[var(--action-default-color)]",
    "hover:bg-[var(--button-secondary-normal-bg-color)]",
    "focus-visible:shadow-[0_0_0_4px_var(--button-default-focus)]",
    "disabled:text-[var(--button-disable-color)]",
  ),
  destructive: cn(
    "border border-transparent bg-[var(--palette-functional-danger-danger-500)] text-[var(--neutral-theme-000)]",
    "hover:bg-[var(--danger-theme-600)]",
    "focus-visible:shadow-[0_0_0_4px_var(--button-destructive-focus)]",
    "disabled:bg-[var(--button-disable-color)]",
  ),
  destructiveSecondary: cn(
    "border-2 border-[var(--palette-functional-danger-danger-500)]",
    "bg-[var(--button-secondary-destructive-normal-bg-color)] text-[var(--palette-functional-danger-danger-500)]",
    "hover:bg-[var(--button-secondary-destructive-hover-bg-color)]",
    "focus-visible:shadow-[0_0_0_4px_var(--button-destructive-focus)]",
    "disabled:border-[var(--button-disable-color)] disabled:bg-[var(--button-disable-color)] disabled:text-[var(--neutral-theme-000)]",
  ),
  special: cn(
    "border border-transparent bg-[var(--button-special-bg-color)] text-[var(--action-default-color)]",
    "hover:bg-[var(--neutral-theme-050)]",
    "focus-visible:shadow-[0_0_0_4px_var(--button-default-focus)]",
    "disabled:bg-[var(--button-disable-color)] disabled:text-[var(--neutral-theme-000)]",
  ),
};

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ className, variant = "primary", asChild = false, size = "default", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const resolvedVariant = variant === "solid" ? "primary" : variant;

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--design-button-corner-radius,18px)] transition-colors",
          "focus-visible:outline-none",
          "disabled:cursor-not-allowed",
          sizeClasses[size],
          variantClasses[resolvedVariant],
          className,
        )}
        {...props}
      />
    );
  },
);

PillButton.displayName = "PillButton";
