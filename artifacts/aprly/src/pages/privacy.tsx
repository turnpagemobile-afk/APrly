import { useEffect } from "react";

const LAST_UPDATED = "May 7, 2026";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy — APRly.ai";
  }, []);

  return (
    <article className="app-page-marketing max-w-3xl py-16 cabinet:py-24 space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
          Legal
        </p>
        <h1 className="text-4xl cabinet:text-5xl font-black tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
      </header>

      <section className="space-y-5 text-base leading-relaxed text-foreground/85">
        <p>
          This page is a placeholder. The final Privacy Policy is being prepared
          alongside our launch and will describe in detail how APRly collects,
          stores, and processes user data.
        </p>
        <p>
          As a directional summary: APRly does not store bank credentials.
          Account access is mediated by short-lived Plaid tokens. Sensitive data
          is encrypted at rest using AES-256, and all traffic is protected with
          TLS 1.2 or higher. We retain account data for 30 days after an account
          becomes inactive, in line with GDPR and CCPA orientation.
        </p>
        <p>
          For inquiries while this document is being finalized, contact us at{" "}
          <a
            href="mailto:hello@aprly.ai"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@aprly.ai
          </a>
          .
        </p>
      </section>
    </article>
  );
}
