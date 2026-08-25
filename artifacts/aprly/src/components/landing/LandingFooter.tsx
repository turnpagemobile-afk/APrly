import { Link } from "wouter";
import { footerContent } from "@/content/landing";
import { sharedAsset } from "@/lib/shared-assets";
import { cn } from "@/lib/utils";

const SOCIAL_ICON_SRC: Record<string, string> = {
  instagram: sharedAsset("instagram.svg"),
  facebook: sharedAsset("facebook.svg"),
  linkedin: sharedAsset("linkedin.svg"),
};

type LandingFooterProps = {
  copyright: string;
  /** Logo link target (cabinet uses dashboard home). Unused in white-green bar; kept for API compat. */
  homeHref?: string;
  className?: string;
};

function PlaidBadge() {
  return (
    <img
      src={sharedAsset("plaid-logo-footer.png")}
      alt="Plaid verified"
      className="h-8 w-auto object-contain bp840:h-9"
      loading="lazy"
    />
  );
}

function FooterLinks() {
  const [termsLink, privacyLink] = footerContent.links;

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-x-2 app-button-button-l-m text-action bp840:justify-end"
      aria-label="Footer"
    >
      <Link href={termsLink.href} className="transition-opacity hover:opacity-80">
        {termsLink.label}
      </Link>
      <span className="text-action" aria-hidden>
        /
      </span>
      <Link href={privacyLink.href} className="transition-opacity hover:opacity-80">
        {privacyLink.label}
      </Link>
    </nav>
  );
}

function FooterSocial() {
  return (
    <div className="flex items-center gap-5">
      {footerContent.social.map((item) => {
        const iconSrc = SOCIAL_ICON_SRC[item.id];
        if (!iconSrc) return null;
        return (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center transition-opacity hover:opacity-80"
          >
            <img src={iconSrc} alt={item.label} className="h-6 w-6 shrink-0" />
          </a>
        );
      })}
    </div>
  );
}

/** Unified site footer (landing + cabinet) — white-green bottom bar. */
export function LandingFooter({ copyright, className }: LandingFooterProps) {
  return (
    <footer className={cn("w-full bg-[var(--footer-bg-color)] text-[var(--neutral-theme-000)]", className)}>
      <div className="box-border w-full max-w-none px-5 py-5 bp600:px-6 bp1200:px-8">
        {/* Narrow: stacked */}
        <div className="flex flex-col items-center gap-5 text-center bp840:hidden">
          <PlaidBadge />
          <FooterLinks />
          <FooterSocial />
          <p className="app-text-p2-regular text-[var(--neutral-theme-400)]">{copyright}</p>
        </div>

        {/* bp840+: two columns */}
        <div className="hidden w-full items-end justify-between gap-5 bp840:flex">
          <div className="flex flex-col items-start gap-3">
            <PlaidBadge />
            <p className="app-text-p2-regular text-[var(--neutral-theme-400)]">{copyright}</p>
          </div>
          <div className="flex flex-col items-end gap-3 text-right">
            <FooterLinks />
            <FooterSocial />
          </div>
        </div>
      </div>
    </footer>
  );
}
