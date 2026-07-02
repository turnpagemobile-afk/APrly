import { Link } from "wouter";
import { footerContent } from "@/content/landing";
import { sharedAsset } from "@/lib/shared-assets";
import { cn } from "@/lib/utils";

const SOCIAL_ICON_SRC: Record<string, string> = {
  instagram: sharedAsset("instagram.svg"),
  facebook: sharedAsset("facebook.svg"),
  linkedin: sharedAsset("linkedin.svg"),
};

type LandingFooterBottomBarProps = {
  copyright: string;
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
      className="flex flex-wrap items-center justify-center gap-x-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary-theme-400)] bp840:justify-end bp840:text-sm"
      aria-label="Footer"
    >
      <Link href={termsLink.href} className="transition-opacity hover:opacity-80">
        {termsLink.label}
      </Link>
      <span className="text-[var(--primary-theme-400)]" aria-hidden>
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
            className="transition-opacity hover:opacity-80"
          >
            <img src={iconSrc} alt="" className="h-5 w-5" aria-hidden />
          </a>
        );
      })}
    </div>
  );
}

export function LandingFooterBottomBar({ copyright, className }: LandingFooterBottomBarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col items-center gap-5 text-center bp840:hidden">
        <PlaidBadge />
        <FooterLinks />
        <FooterSocial />
        <p className="app-text-p3-regular text-white/70">{copyright}</p>
      </div>

      <div className="hidden w-full items-end justify-between gap-5 bp840:flex">
        <div className="flex flex-col items-start gap-3">
          <PlaidBadge />
          <p className="app-text-p3-regular text-white/70">{copyright}</p>
        </div>
        <div className="flex flex-col items-end gap-3 text-right">
          <FooterLinks />
          <FooterSocial />
        </div>
      </div>
    </div>
  );
}
