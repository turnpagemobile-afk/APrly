import { forwardRef, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  authFieldHaloClass,
  authFieldInputInnerClass,
  authFieldShellClass,
} from "./auth-field-styles";

export type AuthTextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  error?: string | null;
  /** Error styling without showing a message below the field */
  invalid?: boolean;
  labelClassName?: string;
};

export const AuthTextInput = forwardRef<HTMLInputElement, AuthTextInputProps>(
  ({ id, label, error, invalid, className, labelClassName, ...props }, ref) => {
    const hasError = invalid ?? Boolean(error);

    return (
      <div className="space-y-2">
        <Label
          htmlFor={id}
          className={cn(
            "app-input-x1-input-x1-label text-[var(--input-label-text-color)]",
            labelClassName,
          )}
        >
          {label}
        </Label>
        <div className={authFieldHaloClass(hasError)}>
          <div className={authFieldShellClass(hasError)}>
            <Input
              ref={ref}
              id={id}
              className={cn(authFieldInputInnerClass, className)}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? `${id}-error` : undefined}
              {...props}
            />
          </div>
        </div>
        {error ? (
          <p id={`${id}-error`} className="text-center text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

AuthTextInput.displayName = "AuthTextInput";
