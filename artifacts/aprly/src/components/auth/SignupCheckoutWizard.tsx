import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { SignupCheckoutModal } from "@/components/auth/SignupCheckoutModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
        message: "Passwords must match.",
        path: ["confirmPassword"],
      });
    }
  });

type Step = 1 | 3;

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

type SignupCheckoutWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Keeps host mounted while redirecting to Stripe after dialog closes */
  onBeginStripeRedirect?: () => void;
  /** When set (e.g. from ?stripe_session=), start at payment wait step */
  initialStripeSessionId?: string | null;
  initialEmail?: string | null;
  initialName?: string | null;
};

export function SignupCheckoutWizard({
  open,
  onOpenChange,
  onBeginStripeRedirect,
  initialStripeSessionId,
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
  const step3SideEffectsStartedRef = useRef(false);
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

  const resetForm = useCallback(() => {
    setStep(1);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setTermsAccepted(false);
    setFieldErrors({});
    setCheckoutUserEmail(null);
    cardsImportStartedRef.current = false;
    sessionSyncedRef.current = false;
    checkoutPaidRef.current = false;
    step3SideEffectsStartedRef.current = false;
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
    if (!open || step !== 3 || !checkoutPaidRef.current) return undefined;
    if (step3SideEffectsStartedRef.current) return undefined;
    step3SideEffectsStartedRef.current = true;

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
      setStep(3);
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
    if (step !== 3 || !checkoutUserEmail) return;
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
      onOpenChange(false);
      releaseDialogScrollLock();
      goToCabinet("/dashboard?tab=home");
    } catch (err: unknown) {
      setIsFinishing(false);
      toast({
        title: "Could not save profile",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const allowDismiss = !registerMutation.isPending && !isFinishing;

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
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {step === 1 ? "Create account" : "Your profile"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {step === 1
              ? "All fields are required. Payment is only needed when you send a plan to a partner."
              : "Add your first and last name — email cannot be changed here."}
          </p>
        </div>

        <div
          className={cn(
            step !== 1 && "hidden",
            step === 1 && "block",
          )}
          aria-hidden={step !== 1}
        >
          <form className="grid gap-4 pt-2" onSubmit={handleRegisterSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="su-email">Email</Label>
              <Input
                id="su-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(ev) => {
                  setEmail(ev.target.value);
                  setFieldErrors((prev) => {
                    if (!prev.email?.length) return prev;
                    const { email: _e, ...rest } = prev;
                    return rest;
                  });
                }}
              />
              {fieldErrors.email?.length ? (
                <p className="text-sm text-destructive">{fieldErrors.email.join(" ")}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="su-password">Password (8–20 characters)</Label>
              <Input
                id="su-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={20}
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
              />
              {fieldErrors.password?.length ? (
                <p className="text-sm text-destructive">{fieldErrors.password.join(" ")}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="su-confirm">Confirm password</Label>
              <Input
                id="su-confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={20}
                value={confirmPassword}
                onChange={(ev) => setConfirmPassword(ev.target.value)}
              />
              {fieldErrors.confirmPassword?.length ? (
                <p className="text-sm text-destructive">{fieldErrors.confirmPassword.join(" ")}</p>
              ) : !step1Parsed.success &&
                (step1Parsed.error.flatten().fieldErrors.confirmPassword ?? []).length > 0 ? (
                <p className="text-sm text-destructive">
                  {(step1Parsed.error.flatten().fieldErrors.confirmPassword ?? []).join(" ")}
                </p>
              ) : null}
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="su-terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(v === true)}
              />
              <Label htmlFor="su-terms" className="text-sm font-normal leading-snug cursor-pointer">
                I accept the Terms of Service and Privacy Policy
              </Label>
            </div>
            {fieldErrors.termsAccepted?.length ? (
              <p className="text-sm text-destructive">{fieldErrors.termsAccepted.join(" ")}</p>
            ) : null}
            <Button type="submit" disabled={registerMutation.isPending || !step1FormValid}>
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </div>

        <div
          className={cn(
            step !== 3 && "hidden",
            step === 3 && "block",
          )}
          aria-hidden={step !== 3}
        >
          {isFinishing ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              Finishing your account…
            </div>
          ) : (
          <form className="grid gap-4 pt-2" onSubmit={handleProfileSubmit}>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={checkoutUserEmail ?? ""} readOnly disabled className="bg-muted" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="su-fn">First name</Label>
              <Input
                id="su-fn"
                required
                autoComplete="given-name"
                value={profileFirst}
                onChange={(ev) => setProfileFirst(ev.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="su-ln">Last name</Label>
              <Input
                id="su-ln"
                required
                autoComplete="family-name"
                value={profileLast}
                onChange={(ev) => setProfileLast(ev.target.value)}
              />
            </div>
            <Button type="submit" disabled={patchMutation.isPending}>
              {patchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save and go to dashboard"
              )}
            </Button>
          </form>
          )}
        </div>
    </SignupCheckoutModal>
  );
}
