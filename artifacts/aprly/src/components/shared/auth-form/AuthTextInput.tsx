import { forwardRef, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authInputClass } from "./auth-field-styles";

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
        <Input
          ref={ref}
          id={id}
          className={cn(authInputClass(hasError), className)}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-error` : undefined}
          {...props}
        />
        {error ? (
          <p id={`${id}-error`} className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

AuthTextInput.displayName = "AuthTextInput";
