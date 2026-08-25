import type { OpenSignupOptions } from "@/lib/signup-checkout-context";

type OpenSignupHandler = (options?: OpenSignupOptions) => void;

let openSignupHandler: OpenSignupHandler | null = null;

/** Called from SignupCheckoutProvider so Bit can open the signup modal. */
export function registerBitOpenSignup(handler: OpenSignupHandler): () => void {
  openSignupHandler = handler;
  return () => {
    if (openSignupHandler === handler) {
      openSignupHandler = null;
    }
  };
}

export type BitOpenFormId = "login" | "signup";

export function isAllowedBitOpenForm(form: string): form is BitOpenFormId {
  return form === "login" || form === "signup";
}

/**
 * Open login page or signup modal for Bit `openForm` tool.
 * `navigateToLogin` should set wouter location or hard-nav to `/login`.
 */
export function applyBitOpenForm(
  form: string,
  navigateToLogin: () => void,
): { ok: true; form: BitOpenFormId } | { ok: false; error: string } {
  if (!isAllowedBitOpenForm(form)) {
    return { ok: false, error: `Form not allowed: ${form}` };
  }

  if (form === "login") {
    navigateToLogin();
    return { ok: true, form };
  }

  if (!openSignupHandler) {
    return {
      ok: false,
      error: "Signup form is not available on this screen. Go to the landing page first.",
    };
  }
  openSignupHandler();
  return { ok: true, form };
}
