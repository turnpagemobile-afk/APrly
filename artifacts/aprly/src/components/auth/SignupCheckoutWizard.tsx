import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ApiError } from "@workspace/api-client-react/custom-fetch";
import {
  getCheckoutSessionStatus,
  getGetCheckoutSessionStatusQueryKey,
  useImportMyCards,
  usePatchMe,
  useRegisterAndCheckout,
} from "@workspace/api-client-react";
import {
  clearOptimizerSnapshot,
  loadOptimizerSnapshot,
  snapshotCardsForImport,
} from "@/lib/optimizerSnapshot";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type Step = 1 | 2 | 3;

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
  /** When set (e.g. from ?stripe_session=), start at payment wait step */
  initialStripeSessionId?: string | null;
  initialEmail?: string | null;
  initialName?: string | null;
};

export function SignupCheckoutWizard({
  open,
  onOpenChange,
  initialStripeSessionId,
  initialEmail,
  initialName,
}: SignupCheckoutWizardProps) {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null);
  const [checkoutUserEmail, setCheckoutUserEmail] = useState<string | null>(null);

  const registerMutation = useRegisterAndCheckout();
  const patchMutation = usePatchMe();
  const importCardsMutation = useImportMyCards();
  const cardsImportStartedRef = useRef(false);

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

  const sessionQueryKey = useMemo(
    () =>
      stripeSessionId
        ? getGetCheckoutSessionStatusQueryKey({ stripeSessionId })
        : ["checkout-session-status", "idle"],
    [stripeSessionId],
  );

  const sessionQuery = useQuery({
    queryKey: sessionQueryKey,
    queryFn: ({ signal }) =>
      getCheckoutSessionStatus({ stripeSessionId: stripeSessionId! }, { signal }),
    enabled: open && step === 2 && Boolean(stripeSessionId),
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      if (s === "paid" || s === "failed" || s === "expired") return false;
      return 2000;
    },
  });

  const resetForm = useCallback(() => {
    setStep(1);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setTermsAccepted(false);
    setFieldErrors({});
    setStripeSessionId(null);
    setCheckoutUserEmail(null);
    cardsImportStartedRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }
    if (initialStripeSessionId) {
      setStripeSessionId(initialStripeSessionId);
      setStep(2);
      return;
    }
    if (initialEmail?.trim()) {
      setEmail(initialEmail.trim());
    }
  }, [open, initialStripeSessionId, initialEmail, resetForm]);

  useEffect(() => {
    if (!open || step !== 2) return;
    const d = sessionQuery.data;
    if (!d) return;
    if (d.status === "paid" && d.user?.email) {
      setCheckoutUserEmail(d.user.email);
      setStep(3);
    }
  }, [open, step, sessionQuery.data]);

  useEffect(() => {
    if (!open || sessionQuery.data?.status !== "paid") return;
    if (cardsImportStartedRef.current) return;

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
          description: "Your account is active, but calculator cards were not imported. Try again from the dashboard later.",
          variant: "destructive",
        });
      });
  }, [open, sessionQuery.data?.status, importCardsMutation]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step1FormValid) return;
    setFieldErrors({});
    try {
      const res = await registerMutation.mutateAsync({
        data: {
          email,
          password,
          confirmPassword,
          termsAccepted,
        },
      });
      window.location.assign(res.checkoutUrl);
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
    try {
      await patchMutation.mutateAsync({
        data: { firstName: profileFirst.trim(), lastName: profileLast.trim() },
      });
      onOpenChange(false);
      navigate("/dashboard");
    } catch (err: unknown) {
      toast({
        title: "Could not save profile",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const status = sessionQuery.data?.status;
  const showStep2Error =
    step === 2 &&
    (status === "failed" ||
      status === "expired" ||
      (sessionQuery.isFetched && sessionQuery.isError));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Create account"}
            {step === 2 && "Pay with Stripe"}
            {step === 3 && "Your profile"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 &&
              "All fields are required. You will continue to secure Stripe Checkout in this window."}
            {step === 2 &&
              "After you pay, you will return here automatically while we finish your account."}
            {step === 3 && "Add your first and last name — email cannot be changed here."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
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
                "Continue to Stripe checkout"
              )}
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="grid gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {(status === "pending" || status === "processing" || sessionQuery.isLoading) && (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              )}
              {status === "pending" && "Waiting for payment to complete…"}
              {status === "processing" && "Payment received, finishing your account…"}
              {!status && sessionQuery.isLoading && "Checking status…"}
            </div>
            {showStep2Error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <p className="font-medium text-destructive">Payment not completed or session expired</p>
                <p className="mt-1 text-muted-foreground">
                  Check the Stripe tab or tap &quot;Check again&quot;.
                </p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => void sessionQuery.refetch()}>
                Check again
              </Button>
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
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
      </DialogContent>
    </Dialog>
  );
}
