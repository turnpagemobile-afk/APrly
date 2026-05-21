import { SignupCheckoutWizard } from "@/components/auth/SignupCheckoutWizard";
import { useSignupCheckout } from "@/lib/signup-checkout-context";

/** Renders signup wizard outside the landing tree (avoids Framer Motion + Radix races). */
export function SignupCheckoutHost() {
  const {
    open,
    stripeRedirecting,
    mountKey,
    initialStripeSessionId,
    initialEmail,
    initialName,
    closeSignup,
    beginStripeRedirect,
  } = useSignupCheckout();

  if (!open && !stripeRedirecting) return null;

  return (
    <SignupCheckoutWizard
      key={mountKey}
      open={open}
      onOpenChange={(next) => {
        if (!next && !stripeRedirecting) closeSignup();
      }}
      onBeginStripeRedirect={beginStripeRedirect}
      initialStripeSessionId={initialStripeSessionId}
      initialEmail={initialEmail}
      initialName={initialName}
    />
  );
}
