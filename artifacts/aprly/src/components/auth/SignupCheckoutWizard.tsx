import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { goToCabinet } from "@/lib/app-navigation";
import { releaseDialogScrollLock } from "@/lib/release-dialog-scroll-lock";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ApiError } from "@workspace/api-client-react/custom-fetch";
import {
  getGetDashboardTabQueryKey,
  useImportMyCards,
  usePatchMe,
} from "@workspace/api-client-react";
import { registerAccount } from "@/lib/payment-api";
import { readGuestSessionId } from "@/lib/guest-session";
import { syncAuthSession } from "@/lib/auth-session";
import {
  clearOptimizerSnapshot,
  loadOptimizerSnapshot,
  snapshotCardsForImport,
} from "@/lib/optimizerSnapshot";
import { AuthCheckbox } from "@/components/shared/auth-form/AuthCheckbox";
import { AuthPasswordInput } from "@/components/shared/auth-form/AuthPasswordInput";
import { AuthTextInput } from "@/components/shared/auth-form/AuthTextInput";
import { SignupCheckoutModal } from "@/components/auth/SignupCheckoutModal";
import { PillButton } from "@/components/shared/PillButton";
import { StepProgressPills } from "@/components/shared/StepProgressPills";
import { authContent } from "@/content/landing";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";

const step1Schema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(20),
    confirmPassword: z.string().min(8).max(20),
    termsAccepted: z.literal(true),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: authContent.signup.errors.passwordsMismatch,
        path: ["confirmPassword"],
      });
    }
  });

type Step = 1 | 2;

type FieldErrors = Record<string, string[]>;

function readFieldErrors(err: unknown): FieldErrors | null {
  if (!(err instanceof ApiError) || err.data == null || typeof err.data !== "object") {
    return null;
  }
  const fe = (err.data as { fieldErrors?: unknown }).fieldErrors;
  if (!fe || typeof fe !== "object") return null;
  const out: FieldErrors = {};
  for (const [k, v] of Object.entries(fe)) {
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
      out[k] = v as string[];
    }
  }
  return Object.keys(out).length ? out : null;
}

function parseInitialName(initialName?: string | null) {
  const trimmed = initialName?.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

type SignupCheckoutWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBeginStripeRedirect?: () => void;
  initialStripeSessionId?: string | null;
  initialEmail?: string | null;
  initialName?: string | null;
};

export function SignupCheckoutWizard({
  open,
  onOpenChange,
  initialEmail,
  initialName,
}: SignupCheckoutWizardProps) {
  const queryClient = useQueryClient();

  const refreshAuthSession = useCallback(
    () => syncAuthSession(queryClient),
    [queryClient],
  );
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const registerMutation = useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      confirmPassword: string;
      termsAccepted: boolean;
      guestSessionId?: string;
    }) => registerAccount(data),
  });
  const patchMutation = usePatchMe();
  const importCardsMutation = useImportMyCards();
  const cardsImportStartedRef = useRef(false);
  const sessionSyncedRef = useRef(false);
  const checkoutPaidRef = useRef(false);
  const profileSideEffectsStartedRef = useRef(false);

  const step1Parsed = useMemo(
    () =>
      step1Schema.safeParse({
        email,
        password,
        confirmPassword,
        termsAccepted,
      }),
    [email, password, confirmPassword, termsAccepted],
  );
  const step1FormValid = step1Parsed.success;

  const emailEmpty = submitAttempted && !email.trim();
  const passwordEmpty = submitAttempted && !password;
  const confirmEmpty = submitAttempted && !confirmPassword;
  const emailInvalid =
    submitAttempted &&
    email.trim().length > 0 &&
    !step1Parsed.success &&
    (step1Parsed.error.flatten().fieldErrors.email?.length ?? 0) > 0;
  const confirmMismatch =
    submitAttempted &&
    !fieldErrors.confirmPassword?.length &&
    !step1Parsed.success &&
    (step1Parsed.error.flatten().fieldErrors.confirmPassword ?? []).length > 0;

  const emailError = fieldErrors.email?.length
    ? fieldErrors.email.join(" ")
    : emailEmpty
      ? authContent.signup.errors.emailRequired
      : emailInvalid
        ? authContent.signup.errors.emailInvalid
        : null;

  const passwordError = fieldErrors.password?.length
    ? fieldErrors.password.join(" ")
    : passwordEmpty
      ? authContent.signup.errors.passwordRequired
      : null;

  const confirmPasswordError = fieldErrors.confirmPassword?.length
    ? fieldErrors.confirmPassword.join(" ")
    : confirmEmpty
      ? authContent.signup.errors.confirmRequired
      : confirmMismatch
        ? authContent.signup.errors.passwordsMismatch
        : null;

  const termsError = fieldErrors.termsAccepted?.length
    ? fieldErrors.termsAccepted.join(" ")
    : submitAttempted && !termsAccepted
      ? authContent.signup.errors.termsRequired
      : null;

  const resetForm = useCallback(() => {
    setStep(1);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setTermsAccepted(false);
    setSubmitAttempted(false);
    setFieldErrors({});
    cardsImportStartedRef.current = false;
    sessionSyncedRef.current = false;
    checkoutPaidRef.current = false;
    profileSideEffectsStartedRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
      return undefined;
    }
    if (initialEmail?.trim()) {
      setEmail(initialEmail.trim());
    }
    return undefined;
  }, [open, initialEmail, resetForm]);

  useEffect(() => {
    if (!open || step !== 2 || !checkoutPaidRef.current) return undefined;
    if (profileSideEffectsStartedRef.current) return undefined;
    profileSideEffectsStartedRef.current = true;

    const id = window.setTimeout(() => {
      if (!sessionSyncedRef.current) {
        sessionSyncedRef.current = true;
        void refreshAuthSession().catch(() => {
          sessionSyncedRef.current = false;
        });
      }

      if (cardsImportStartedRef.current) return;

      const guestSessionId = readGuestSessionId();
      if (guestSessionId) {
        cardsImportStartedRef.current = true;
        clearOptimizerSnapshot();
        void queryClient.invalidateQueries({ queryKey: getGetDashboardTabQueryKey() });
        return;
      }

      const snapshot = loadOptimizerSnapshot();
      if (!snapshot) return;

      const cards = snapshotCardsForImport(snapshot);
      if (!cards.length) {
        clearOptimizerSnapshot();
        return;
      }

      cardsImportStartedRef.current = true;
      void importCardsMutation
        .mutateAsync({ data: { cards } })
        .then(() => clearOptimizerSnapshot())
        .catch(() => {
          cardsImportStartedRef.current = false;
          toast({
            title: "Could not save your cards",
            description:
              "Your account is active, but calculator cards were not imported. Try again from the dashboard later.",
            variant: "destructive",
          });
        });
    }, 400);

    return () => clearTimeout(id);
  }, [open, step, refreshAuthSession, importCardsMutation, queryClient]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!step1FormValid) return;
    setFieldErrors({});
    try {
      await registerMutation.mutateAsync({
        email,
        password,
        confirmPassword,
        termsAccepted,
        guestSessionId: readGuestSessionId() ?? undefined,
      });
      await refreshAuthSession();
      checkoutPaidRef.current = true;

      const parsedName = parseInitialName(initialName);
      if (parsedName?.firstName) {
        try {
          await patchMutation.mutateAsync({
            data: {
              firstName: parsedName.firstName,
              lastName: parsedName.lastName,
            },
          });
          await refreshAuthSession();
        } catch {
          // Non-blocking: account is created even if profile patch fails.
        }
      }

      setStep(2);
    } catch (err: unknown) {
      const fe = readFieldErrors(err);
      if (fe) {
        setFieldErrors(fe);
        return;
      }
      if (err instanceof ApiError && err.status === 503) {
        toast({
          title: "Checkout unavailable",
          description: "Stripe is not configured on the server. Check environment variables.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSuccessOk = () => {
    onOpenChange(false);
    releaseDialogScrollLock();
    goToCabinet();
  };

  const allowDismiss = !registerMutation.isPending;

  const handleRequestClose = () => {
    if (!allowDismiss) return;
    onOpenChange(false);
  };

  return (
    <SignupCheckoutModal
      open={open}
      onRequestClose={handleRequestClose}
      allowDismiss={allowDismiss}
    >
      {step === 1 ? (
        <>
          <p className="app-header-h6 text-average pr-10">
            {authContent.signup.step1Title}
          </p>
          <StepProgressPills totalSteps={2} currentStep={step} className="mt-3" />

          <form className="mt-6 space-y-5" onSubmit={handleRegisterSubmit}>
            <AuthTextInput
              id="su-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              error={emailError}
              onChange={(ev) => {
                setEmail(ev.target.value);
                setFieldErrors((prev) => {
                  if (!prev.email?.length) return prev;
                  const { email: _e, ...rest } = prev;
                  return rest;
                });
              }}
            />

            <AuthPasswordInput
              id="su-password"
              label="Password"
              autoComplete="new-password"
              minLength={8}
              maxLength={20}
              value={password}
              error={passwordError}
              onChange={(ev) => setPassword(ev.target.value)}
            />

            <AuthPasswordInput
              id="su-confirm"
              label="Confirm password"
              autoComplete="new-password"
              minLength={8}
              maxLength={20}
              value={confirmPassword}
              error={confirmPasswordError}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
            />

            <div className="flex items-start gap-2">
              <AuthCheckbox
                id="su-terms"
                checked={termsAccepted}
                invalid={Boolean(termsError)}
                onCheckedChange={(v) => {
                  const accepted = v === true;
                  setTermsAccepted(accepted);
                  if (accepted) {
                    setFieldErrors((prev) => {
                      if (!prev.termsAccepted?.length) return prev;
                      const { termsAccepted: _t, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
              />
              <Label htmlFor="su-terms" className="app-text-p1-regular text-average leading-snug">
                <span>I&apos;ve read and agree to the </span>
                <Link
                  href="/terms"
                  className="app-text-p1-bold text-action hover:underline"
                >
                  Terms of Service
                </Link>
                <span> and </span>
                <Link
                  href="/privacy"
                  className="app-text-p1-bold text-action hover:underline"
                >
                  Privacy Policy
                </Link>
                <span>.</span>
              </Label>
            </div>
            {termsError ? (
              <p className="text-center text-sm text-destructive">{termsError}</p>
            ) : null}

            <PillButton
              type="submit"
              size="lg"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait…
                </>
              ) : (
                authContent.signup.submit
              )}
            </PillButton>
          </form>

          <div className="mx-2.5 mt-6 border-t border-[var(--primary-theme-200)] pt-5 text-center">
            <span className="app-text-p1-regular text-hint">
              {authContent.signup.loginPrompt}{" "}
            </span>
            <Link
              href="/login"
              className="app-button-button-l-m text-action hover:underline"
              onClick={() => onOpenChange(false)}
            >
              {authContent.signup.loginLink}
            </Link>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <p className="app-header-h6 text-average w-full pr-10 text-left">
            {authContent.signup.step1Title}
          </p>
          <StepProgressPills totalSteps={2} currentStep={2} className="mt-3 w-full" />
          <CheckCircle2
            className="mt-6 h-16 w-16 text-[var(--primary-theme-500)]"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="app-header-h6 text-title mt-6">
            {authContent.signup.successTitle}
          </p>
          <p className="mt-3 text-sm text-[var(--hint-text-color)]">
            {authContent.signup.successSubtitle}
          </p>
          <PillButton type="button" size="lg" className="mt-8 w-full" onClick={handleSuccessOk}>
            {authContent.signup.successOk}
          </PillButton>
        </div>
      ) : null}
    </SignupCheckoutModal>
  );
}
