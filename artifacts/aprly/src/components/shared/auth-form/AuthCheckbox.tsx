import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type AuthCheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  invalid?: boolean;
};

export const AuthCheckbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  AuthCheckboxProps
>(({ className, invalid, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      "grid h-5 w-5 shrink-0 place-content-center rounded-[2px] border border-[var(--input-default-border-color)] bg-[var(--input-default-bg-color)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-theme-500)] focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:border-[var(--primary-theme-500)] data-[state=checked]:bg-[var(--primary-theme-500)] data-[state=checked]:text-white",
      invalid && "border-destructive",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="grid place-content-center text-current">
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

AuthCheckbox.displayName = "AuthCheckbox";
