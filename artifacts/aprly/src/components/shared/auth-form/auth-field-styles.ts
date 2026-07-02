import { cn } from "@/lib/utils";

export const authInputBase = cn(
  "min-h-[var(--design-input-min-height-x1,52px)] w-full border shadow-none",
  "rounded-[12px]",
  "py-[14px] pl-3 pr-[14px]",
  "text-sm text-[var(--input-text-color)]",
  "transition-colors focus-visible:outline-none focus-visible:ring-0",
);

export function authInputClass(hasError: boolean) {
  if (hasError) {
    return cn(authInputBase, "border-destructive bg-[var(--input-error-bg-color)]");
  }
  return cn(
    authInputBase,
    "border-[var(--input-default-border-color)] bg-[var(--input-default-bg-color)]",
    "focus-visible:border-[var(--input-focus-border-color)] focus-visible:bg-[var(--input-focus-bg-color)]",
  );
}
