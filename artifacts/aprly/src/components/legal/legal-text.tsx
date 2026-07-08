import type { ReactNode } from "react";

const LINKS: Record<string, { href: string; external?: boolean }> = {
  "hello@aprly.ai": { href: "mailto:hello@aprly.ai" },
  "support@aprly.ai": { href: "mailto:support@aprly.ai" },
  "plaid.com/legal": { href: "https://plaid.com/legal", external: true },
  "stripe.com/privacy": { href: "https://stripe.com/privacy", external: true },
  "stripe.com/legal": { href: "https://stripe.com/legal", external: true },
};

const LINK_PATTERN = new RegExp(
  `(${Object.keys(LINKS)
    .map((k) => k.replace(/\./g, "\\."))
    .join("|")})`,
  "g",
);

export function formatLegalInline(text: string): ReactNode[] {
  const parts = text.split(LINK_PATTERN);
  return parts.map((part, i) => {
    const link = LINKS[part];
    if (!link) return part;
    return (
      <a
        key={`${part}-${i}`}
        href={link.href}
        className="text-primary underline-offset-4 hover:underline"
        {...(link.external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {part}
      </a>
    );
  });
}

export function LegalP({ children }: { children: string }) {
  return (
    <p className="text-base leading-relaxed text-foreground/85">
      {formatLegalInline(children)}
    </p>
  );
}

export function LegalH2({ children }: { children: string }) {
  return (
    <h2 className="pt-2 text-lg font-bold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

export function LegalH3({ children }: { children: string }) {
  return (
    <h3 className="pt-1 text-base font-semibold text-foreground">
      {children}
    </h3>
  );
}

export function LegalUl({
  items,
}: {
  items: { label: string; body: string }[];
}) {
  return (
    <ul className="list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground/85">
      {items.map((item) => (
        <li key={item.label}>
          <strong className="font-semibold text-foreground">{item.label}</strong>{" "}
          {formatLegalInline(item.body)}
        </li>
      ))}
    </ul>
  );
}
