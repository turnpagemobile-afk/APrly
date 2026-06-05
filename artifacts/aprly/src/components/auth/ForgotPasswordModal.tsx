import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { ApiError } from "@workspace/api-client-react/custom-fetch";
import { useForgotPassword } from "@workspace/api-client-react";
import { AuthOverlayShell } from "@/components/auth/AuthOverlayShell";
import {
  AuthForgotEmailIllustration,
  AuthForgotLockIllustration,
} from "@/components/auth/AuthForgotIllustrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authContent } from "@/content/landing";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ForgotPasswordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Step = "form" | "success";

const emailSchema = z.string().trim().min(1).email();

const inputBase =
  "h-[var(--design-input-min-height-x1,52px)] rounded-lg border px-3 text-sm text-[var(--input-text-color)] shadow-none transition-colors focus-visible:outline-none focus-visible:ring-0";

function inputClass(hasError: boolean, isFocused: boolean) {
  if (hasError) {
    return cn(inputBase, "border-destructive bg-[var(--input-error-bg-color)]");
  }
  if (isFocused) {
    return cn(
      inputBase,
      "border-[var(--input-focus-border-color)] bg-[var(--input-focus-bg-color)]",
    );
  }
  return cn(
    inputBase,
    "border-[var(--input-default-border-color)] bg-[var(--input-default-bg-color)]",
  );
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const copy = authContent.forgotPassword;
  const forgot = useForgotPassword();
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const dismiss = () => {
    onOpenChange(false);
    setStep("form");
    setEmail("");
    setSubmitAttempted(false);
    setEmailError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setEmailError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError(copy.errors.emailRequired);
      return;
    }

    const parsed = emailSchema.safeParse(trimmed);
    if (!parsed.success) {
      setEmailError(copy.errors.emailInvalid);
      return;
    }

    try {
      await forgot.mutateAsync({ data: { email: parsed.data } });
      setStep("success");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 400) {
        const body = err.data as { fieldErrors?: Record<string, string[]> } | undefined;
        const msg = body?.fieldErrors?.email?.[0];
        setEmailError(msg ?? copy.errors.emailInvalid);
        return;
      }
      setEmailError(copy.errors.serverError);
      toast({
        title: copy.errors.serverError,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthOverlayShell open={open} onDismiss={dismiss} allowDismiss={!forgot.isPending}>
      <p className="pr-10 text-xs font-bold uppercase tracking-widest text-[var(--neutral-theme-900)]">
        {copy.title}
      </p>

      {step === "form" ? (
        <>
          <AuthForgotLockIllustration className="mt-4" />
          <p className="mt-4 text-center text-sm text-[var(--hint-text-color)]">{copy.prompt}</p>

          <form className="mt-5 space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-xs text-[var(--input-label-text-color)]">
                {copy.emailLabel}
              </Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                className={inputClass(Boolean(emailError), focused)}
              />
              {emailError ? (
                <p className="text-sm text-destructive">{emailError}</p>
              ) : null}
            </div>

            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                disabled={forgot.isPending}
                className="min-w-[160px] font-bold uppercase tracking-wide"
              >
                {forgot.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  copy.submit
                )}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <>
          <AuthForgotEmailIllustration className="mt-4" />
          <p className="mt-4 text-center text-sm font-bold uppercase tracking-wide text-[var(--neutral-theme-900)]">
            {copy.successTitle}
          </p>
          <p className="mt-2 text-center text-sm text-[var(--hint-text-color)]">
            {copy.successSubtitle}
          </p>
          <div className="flex justify-center pt-6">
            <Button
              type="button"
              className="min-w-[120px] font-bold uppercase tracking-wide"
              onClick={dismiss}
            >
              {copy.successOk}
            </Button>
          </div>
        </>
      )}
    </AuthOverlayShell>
  );
}
