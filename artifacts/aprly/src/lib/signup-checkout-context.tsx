import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type OpenSignupOptions = {
  stripeSessionId?: string | null;
  email?: string | null;
  name?: string | null;
};

type SignupCheckoutContextValue = {
  open: boolean;
  stripeRedirecting: boolean;
  mountKey: string;
  initialStripeSessionId: string | null;
  initialEmail: string | null;
  initialName: string | null;
  openSignup: (options?: OpenSignupOptions) => void;
  closeSignup: () => void;
  beginStripeRedirect: () => void;
};

const SignupCheckoutContext = createContext<SignupCheckoutContextValue | null>(null);

export function SignupCheckoutProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [stripeRedirecting, setStripeRedirecting] = useState(false);
  const [mountKey, setMountKey] = useState("signup");
  const [initialStripeSessionId, setInitialStripeSessionId] = useState<string | null>(null);
  const [initialEmail, setInitialEmail] = useState<string | null>(null);
  const [initialName, setInitialName] = useState<string | null>(null);

  const openSignup = useCallback((options?: OpenSignupOptions) => {
    setStripeRedirecting(false);
    setInitialStripeSessionId(options?.stripeSessionId ?? null);
    setInitialEmail(options?.email ?? null);
    setInitialName(options?.name ?? null);
    setMountKey(options?.stripeSessionId ?? `signup-${Date.now()}`);
    setOpen(true);
  }, []);

  const closeSignup = useCallback(() => {
    setOpen(false);
    setStripeRedirecting(false);
    setInitialStripeSessionId(null);
    setInitialEmail(null);
    setInitialName(null);
  }, []);

  const beginStripeRedirect = useCallback(() => {
    setStripeRedirecting(true);
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      open,
      stripeRedirecting,
      mountKey,
      initialStripeSessionId,
      initialEmail,
      initialName,
      openSignup,
      closeSignup,
      beginStripeRedirect,
    }),
    [
      open,
      stripeRedirecting,
      mountKey,
      initialStripeSessionId,
      initialEmail,
      initialName,
      openSignup,
      closeSignup,
      beginStripeRedirect,
    ],
  );

  return (
    <SignupCheckoutContext.Provider value={value}>{children}</SignupCheckoutContext.Provider>
  );
}

export function useSignupCheckout(): SignupCheckoutContextValue {
  const ctx = useContext(SignupCheckoutContext);
  if (!ctx) {
    throw new Error("useSignupCheckout must be used within SignupCheckoutProvider");
  }
  return ctx;
}
