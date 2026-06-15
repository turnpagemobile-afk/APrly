import { useEffect } from "react";

const LAST_UPDATED = "May 7, 2026";

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service — APrly.ai";
  }, []);

  return (
    <article className="app-page-marketing max-w-3xl space-y-8 py-16 cabinet:py-24">
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
          Legal
        </p>
        <h1 className="text-4xl font-black tracking-tight cabinet:text-5xl">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
      </header>

      <section className="space-y-5 text-base leading-relaxed text-foreground/85">
        <p>
          This page is a placeholder. The final Terms of Service are being
          prepared alongside our launch and will outline acceptable use, account
          access, billing, and dispute-resolution terms.
        </p>
        <p>
          Directional notes: APrly is currently offered with a one-time Audit
          Access Fee of $39. The product is delivered through a paid web
          application and does not constitute legal, financial, or tax advice.
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
