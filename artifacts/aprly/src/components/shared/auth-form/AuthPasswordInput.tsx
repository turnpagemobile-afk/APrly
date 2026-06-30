import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authInputClass } from "./auth-field-styles";

export type AuthPasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "type"
> & {
  id: string;
  label: string;
  error?: string | null;
  /** Error styling without showing a message below the field */
  invalid?: boolean;
  labelClassName?: string;
};

export const AuthPasswordInput = forwardRef<HTMLInputElement, AuthPasswordInputProps>(
  ({ id, label, error, invalid, className, labelClassName, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
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
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            className={cn(authInputClass(hasError), "pr-10", className)}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? `${id}-error` : undefined}
            {...props}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-theme-500)]"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error ? (
          <p id={`${id}-error`} className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

AuthPasswordInput.displayName = "AuthPasswordInput";
