import { cn } from "@/lib/utils";

/**
 * Outer halo — focus box-shadow only.
 * Must NOT use overflow-hidden (that would clip the 4px mint ring).
 */
export function authFieldHaloClass(hasError: boolean) {
  return cn(
    "w-full rounded-[12px] transition-[box-shadow]",
    hasError
      ? "focus-within:shadow-[0_0_0_4px_var(--button-destructive-focus)]"
      : "focus-within:shadow-[0_0_0_4px_var(--button-default-focus)]",
  );
}

/**
 * Clip shell — 2px border + bg + overflow-hidden so autofill/fill
 * respects rounded corners without covering the border curve.
 */
export function authFieldShellClass(hasError: boolean) {
  return cn(
    "auth-field-shell relative flex w-full items-stretch overflow-hidden rounded-[12px] border-2",
    "transition-[color,background-color,border-color]",
    hasError
      ? "auth-field-shell--error border-destructive bg-[var(--input-error-bg-color)]"
      : [
          "border-[var(--input-default-border-color)] bg-[var(--input-default-bg-color)]",
          "focus-within:border-[var(--input-focus-border-color)] focus-within:bg-[var(--input-focus-bg-color)]",
        ],
  );
}

/** Borderless inner control — ring/outline fully suppressed. */
export const authFieldInputInnerClass = cn(
  "auth-field-input",
  "min-h-[var(--design-input-min-height-x1,52px)] h-auto w-full",
  "rounded-none border-0 bg-transparent shadow-none",
  "py-[14px] pl-3 pr-[14px]",
  "text-sm text-[var(--input-text-color)]",
  "outline-none ring-0 ring-offset-0",
  "focus:outline-none focus-visible:outline-none",
  "focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent",
  "placeholder:text-[var(--input-placeholder-color)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

/** @deprecated Prefer authFieldHaloClass + authFieldShellClass + authFieldInputInnerClass */
export function authInputClass(hasError: boolean) {
  return cn(
    authFieldInputInnerClass,
    "rounded-[12px] border-2 transition-[color,background-color,border-color,box-shadow]",
    hasError
      ? [
          "border-destructive bg-[var(--input-error-bg-color)]",
          "focus:shadow-[0_0_0_4px_var(--button-destructive-focus)]",
          "focus-visible:shadow-[0_0_0_4px_var(--button-destructive-focus)]",
        ]
      : [
          "border-[var(--input-default-border-color)] bg-[var(--input-default-bg-color)]",
          "focus:border-[var(--input-focus-border-color)] focus:bg-[var(--input-focus-bg-color)]",
          "focus:shadow-[0_0_0_4px_var(--button-default-focus)]",
          "focus-visible:border-[var(--input-focus-border-color)] focus-visible:bg-[var(--input-focus-bg-color)]",
          "focus-visible:shadow-[0_0_0_4px_var(--button-default-focus)]",
        ],
  );
}
