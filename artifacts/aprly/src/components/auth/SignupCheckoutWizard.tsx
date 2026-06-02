import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { goToCabinet } from "@/lib/app-navigation";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthBrandLogo } from "@/components/auth/AuthBrandLogo";
import { SignupCheckoutModal } from "@/components/auth/SignupCheckoutModal";
import { SignupProgressBar } from "@/components/auth/SignupProgressBar";
import { authContent } from "@/content/landing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

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

type Step = 1 | 2 | "success";

type FieldErrors = Record<string, string[]>;

const underlineInputClass =
  "h-11 border-b border-x-0 border-t-0 rounded-none bg-transparent px-0 shadow-none focus-visible:ring-0";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [checkoutUserEmail, setCheckoutUserEmail] = useState<string | null>(null);

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
  const [isFinishing, setIsFinishing] = useState(false);

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

  const resetForm = useCallback(() => {
    setStep(1);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setTermsAccepted(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSubmitAttempted(false);
    setFieldErrors({});
    setCheckoutUserEmail(null);
    cardsImportStartedRef.current = false;
    sessionSyncedRef.current = false;
    checkoutPaidRef.current = false;
    profileSideEffectsStartedRef.current = false;
    setIsFinishing(false);
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
      setCheckoutUserEmail(email.trim().toLowerCase());
      checkoutPaidRef.current = true;
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

  const [profileFirst, setProfileFirst] = useState("");
  const [profileLast, setProfileLast] = useState("");

  useEffect(() => {
    if (step !== 2 || !checkoutUserEmail) return;
    const trimmed = initialName?.trim();
    if (trimmed) {
      const parts = trimmed.split(/\s+/);
      setProfileFirst(parts[0] ?? "");
      setProfileLast(parts.slice(1).join(" "));
      return;
    }
    setProfileFirst("");
    setProfileLast("");
  }, [step, checkoutUserEmail, initialName]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFinishing(true);
    try {
      await patchMutation.mutateAsync({
        data: { firstName: profileFirst.trim(), lastName: profileLast.trim() },
      });
      await refreshAuthSession();
      setIsFinishing(false);
      setStep("success");
    } catch (err: unknown) {
      setIsFinishing(false);
      toast({
        title: "Could not save profile",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSuccessOk = () => {
    onOpenChange(false);
    releaseDialogScrollLock();
    goToCabinet("/dashboard?tab=home");
  };

  const allowDismiss =
    !registerMutation.isPending && !isFinishing && !patchMutation.isPending;

  const handleRequestClose = () => {
    if (!allowDismiss) return;
    onOpenChange(false);
  };

  const progressStep: 1 | 2 = step === "success" ? 2 : step;

  return (
    <SignupCheckoutModal
      open={open}
      onRequestClose={handleRequestClose}
      allowDismiss={allowDismiss}
    >
      {step !== "success" ? (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--neutral-theme-900)]">
            {authContent.signup.step1Title}
          </p>
          <AuthBrandLogo className="mt-4" />
          <SignupProgressBar currentStep={progressStep} />
        </>
      ) : null}

      {step === 1 ? (
        <form className="mt-6 space-y-5" onSubmit={handleRegisterSubmit}>
          <div className="space-y-2">
            <Label htmlFor="su-email" className="text-xs text-[var(--hint-text-color)]">
              Email
            </Label>
            <Input
              id="su-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value);
                setFieldErrors((prev) => {
                  if (!prev.email?.length) return prev;
                  const { email: _e, ...rest } = prev;
                  return rest;
                });
              }}
              className={cn(
                underlineInputClass,
                (emailEmpty || emailInvalid || fieldErrors.email?.length) &&
                  "border-destructive bg-[var(--error-box-bg-color)]",
              )}
            />
            {fieldErrors.email?.length ? (
              <p className="text-sm text-destructive">{fieldErrors.email.join(" ")}</p>
            ) : emailEmpty ? (
              <p className="text-sm text-destructive">{authContent.signup.errors.emailRequired}</p>
            ) : emailInvalid ? (
              <p className="text-sm text-destructive">{authContent.signup.errors.emailInvalid}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="su-password" className="text-xs text-[var(--hint-text-color)]">
              Password (8–20 characters)
            </Label>
            <div className="relative">
              <Input
                id="su-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                maxLength={20}
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                className={cn(
                  underlineInputClass,
                  "pr-10",
                  (passwordEmpty || fieldErrors.password?.length) &&
                    "border-destructive bg-[var(--error-box-bg-color)]",
                )}
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--hint-text-color)]"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password?.length ? (
              <p className="text-sm text-destructive">{fieldErrors.password.join(" ")}</p>
            ) : passwordEmpty ? (
              <p className="text-sm text-destructive">
                {authContent.signup.errors.passwordRequired}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="su-confirm" className="text-xs text-[var(--hint-text-color)]">
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="su-confirm"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                maxLength={20}
                value={confirmPassword}
                onChange={(ev) => setConfirmPassword(ev.target.value)}
                className={cn(
                  underlineInputClass,
                  "pr-10",
                  (confirmEmpty ||
                    confirmMismatch ||
                    fieldErrors.confirmPassword?.length) &&
                    "border-destructive bg-[var(--error-box-bg-color)]",
                )}
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--hint-text-color)]"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword?.length ? (
              <p className="text-sm text-destructive">
                {fieldErrors.confirmPassword.join(" ")}
              </p>
            ) : confirmEmpty ? (
              <p className="text-sm text-destructive">
                {authContent.signup.errors.confirmRequired}
              </p>
            ) : confirmMismatch ? (
              <p className="text-sm text-destructive">
                {authContent.signup.errors.passwordsMismatch}
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="su-terms"
              checked={termsAccepted}
              onCheckedChange={(v) => setTermsAccepted(v === true)}
            />
            <Label htmlFor="su-terms" className="text-sm font-normal leading-snug">
              <span className="text-[var(--neutral-theme-900)]">
                I&apos;ve read and agree to the{" "}
              </span>
              <Link href="/terms" className="font-semibold text-primary hover:underline">
                Terms of Service
              </Link>
              <span className="text-[var(--neutral-theme-900)]"> and </span>
              <Link href="/privacy" className="font-semibold text-primary hover:underline">
                Privacy Policy
              </Link>
              <span className="text-[var(--neutral-theme-900)]">.</span>
            </Label>
          </div>
          {fieldErrors.termsAccepted?.length ? (
            <p className="text-sm text-destructive">{fieldErrors.termsAccepted.join(" ")}</p>
          ) : null}

          <Button
            type="submit"
            className="w-full font-bold uppercase tracking-wide"
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
          </Button>

          <p className="text-center text-sm text-[var(--hint-text-color)]">
            {authContent.signup.loginPrompt}{" "}
            <Link
              href="/login"
              className="font-bold uppercase text-primary hover:underline"
              onClick={() => onOpenChange(false)}
            >
              {authContent.signup.loginLink}
            </Link>
          </p>
        </form>
      ) : null}

      {step === 2 ? (
        <>
          <p className="mt-4 text-sm text-[var(--hint-text-color)]">
            {authContent.signup.step2Subtitle}
          </p>
          {isFinishing ? (
            <div className="flex items-center gap-2 py-6 text-sm text-[var(--hint-text-color)]">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              Finishing your account…
            </div>
          ) : (
            <form className="mt-6 space-y-5" onSubmit={handleProfileSubmit}>
              <div className="space-y-2">
                <Label className="text-xs text-[var(--hint-text-color)]">Email</Label>
                <Input
                  value={checkoutUserEmail ?? ""}
                  readOnly
                  disabled
                  className={cn(underlineInputClass, "opacity-70")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-fn" className="text-xs text-[var(--hint-text-color)]">
                  First name
                </Label>
                <Input
                  id="su-fn"
                  required
                  autoComplete="given-name"
                  value={profileFirst}
                  onChange={(ev) => setProfileFirst(ev.target.value)}
                  className={underlineInputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-ln" className="text-xs text-[var(--hint-text-color)]">
                  Last name
                </Label>
                <Input
                  id="su-ln"
                  required
                  autoComplete="family-name"
                  value={profileLast}
                  onChange={(ev) => setProfileLast(ev.target.value)}
                  className={underlineInputClass}
                />
              </div>
              <Button
                type="submit"
                className="w-full font-bold uppercase tracking-wide"
                disabled={patchMutation.isPending}
              >
                {patchMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  authContent.signup.saveToAccount
                )}
              </Button>
            </form>
          )}
        </>
      ) : null}

      {step === "success" ? (
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle2
            className="h-16 w-16 text-[var(--secondary-theme-500)]"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="mt-6 text-lg font-extrabold uppercase tracking-tight text-[var(--neutral-theme-900)]">
            {authContent.signup.successTitle}
          </p>
          <p className="mt-3 text-sm text-[var(--hint-text-color)]">
            {authContent.signup.successSubtitle}
          </p>
          <Button
            type="button"
            className="mt-8 w-full font-bold uppercase tracking-wide"
            onClick={handleSuccessOk}
          >
            {authContent.signup.successOk}
          </Button>
        </div>
      ) : null}
    </SignupCheckoutModal>
  );
}
