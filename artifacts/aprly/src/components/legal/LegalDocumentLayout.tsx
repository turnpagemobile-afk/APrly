import type { ReactNode } from "react";

type LegalDocumentLayoutProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalDocumentLayout({
  title,
  lastUpdated,
  children,
}: LegalDocumentLayoutProps) {
  return (
    <article className="app-page-marketing max-w-3xl space-y-8 py-16 cabinet:py-24">
      <header className="space-y-3">
        <h1 className="text-4xl font-black tracking-tight cabinet:text-5xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </header>
      <section className="space-y-5">{children}</section>
    </article>
  );
}
