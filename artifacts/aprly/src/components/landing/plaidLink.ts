const PLAID_SCRIPT_SRC = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";

/** Minimal surface returned by `window.Plaid.create` (Link handler). */
export type PlaidLinkHandler = {
  open: () => void;
  destroy: () => void;
  exit: (...args: unknown[]) => void;
};

export type PlaidLinkOnSuccess = (publicToken: string, metadata: unknown) => void;
export type PlaidLinkOnExit = () => void;
export type PlaidLinkOnEvent = (eventName: string) => void;

export type PlaidCreateConfig = {
  token: string;
  receivedRedirectUri?: string;
  onSuccess: PlaidLinkOnSuccess;
  onExit?: PlaidLinkOnExit;
  onEvent?: PlaidLinkOnEvent;
};

type PlaidHost = {
  create: (config: Record<string, unknown>) => PlaidLinkHandler;
};

function getPlaidHost(): PlaidHost {
  const host = (window as unknown as { Plaid?: PlaidHost }).Plaid;
  if (!host) {
    throw new Error("Plaid is not available on window");
  }
  return host;
}

let plaidScriptPromise: Promise<void> | null = null;

function hasPlaid(): boolean {
  return Boolean((window as unknown as { Plaid?: PlaidHost }).Plaid);
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function waitForPlaidGlobal(timeoutMs = 8000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (hasPlaid()) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error("Plaid script did not expose window.Plaid in time");
}

/**
 * Ensures Plaid Link's `link-initialize.js` is on the page (single shared promise).
 * Polls for `window.Plaid` so we behave like static HTML even if the script tag was injected earlier.
 */
export async function ensurePlaidScript(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }
  if (hasPlaid()) {
    await nextFrame();
    return;
  }

  if (!plaidScriptPromise) {
    plaidScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = PLAID_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        plaidScriptPromise = null;
        reject(new Error(`Failed to load Plaid script from ${PLAID_SCRIPT_SRC}`));
      };
      document.body.appendChild(script);
    });
  }

  await plaidScriptPromise;
  await waitForPlaidGlobal();
  await nextFrame();
}

/**
 * Tear down a Link handler. Prefer `destroy()` when the session never opened — `exit({force})`
 * on a half-initialized handler can contribute to "Error initializing Plaid Link" on the next create.
 */
export function destroyPlaidHandler(handler: PlaidLinkHandler | null): void {
  if (!handler) return;
  try {
    handler.destroy();
  } catch {
    try {
      handler.exit({ force: true }, () => {
        try {
          handler.destroy();
        } catch {
          /* noop */
        }
      });
    } catch {
      try {
        handler.exit(true);
      } catch {
        /* noop */
      }
    }
  }
}

export function createPlaidLink(config: PlaidCreateConfig): PlaidLinkHandler {
  return getPlaidHost().create(config as Record<string, unknown>);
}

export function resumePlaidLink(config: PlaidCreateConfig): PlaidLinkHandler {
  const handler = createPlaidLink(config);
  openPlaidLinkDeferred(handler);
  return handler;
}

export function openPlaidLinkDeferred(handler: PlaidLinkHandler): void {
  window.setTimeout(() => {
    handler.open();
  }, 0);
}
