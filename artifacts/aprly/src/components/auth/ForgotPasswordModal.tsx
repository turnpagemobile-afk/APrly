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
import { AuthTextInput } from "@/components/shared/auth-form/AuthTextInput";
import { PillButton } from "@/components/shared/PillButton";
import { authContent } from "@/content/landing";
import { toast } from "@/hooks/use-toast";

type ForgotPasswordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Step = "form" | "success";

const emailSchema = z.string().trim().min(1).email();

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const copy = authContent.forgotPassword;
  const forgot = useForgotPassword();
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
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
      <p className="app-header-h6 text-title pr-10">{copy.title}</p>

      {step === "form" ? (
        <>
          <AuthForgotLockIllustration className="mt-4" />
          <p className="app-text-p1-regular text-average mt-4 text-center">{copy.prompt}</p>

          <form className="mt-5 space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <AuthTextInput
              id="forgot-email"
              label={copy.emailLabel}
              type="email"
              autoComplete="email"
              value={email}
              error={emailError}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
            />

            <div className="flex justify-center pt-2">
              <PillButton type="submit" disabled={forgot.isPending} className="min-w-[160px]">
                {forgot.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  copy.submit
                )}
              </PillButton>
            </div>
          </form>
        </>
      ) : (
        <>
          <AuthForgotEmailIllustration className="mt-4" />
          <p className="app-header-h6 text-title mt-4 text-center">{copy.successTitle}</p>
          <p className="app-text-p1-regular text-hint mt-2 text-center">
            {copy.successSubtitle}
          </p>
          <div className="flex justify-center pt-6">
            <PillButton type="button" className="min-w-[120px]" onClick={dismiss}>
              {copy.successOk}
            </PillButton>
          </div>
        </>
      )}
    </AuthOverlayShell>
  );
}
