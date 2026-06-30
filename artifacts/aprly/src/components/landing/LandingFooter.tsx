import { Link } from "wouter";
import { AuthBrandLogo } from "@/components/auth/AuthBrandLogo";
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
  /** Logo link target (cabinet uses dashboard home). */
  homeHref?: string;
};

export function LandingFooter({ copyright, homeHref = "/" }: LandingFooterProps) {
  const [termsLink, privacyLink] = footerContent.links;

  return (
    <footer className="bg-[var(--footer-bg-color)] text-white">
      <div className="box-border w-full max-w-none px-5 py-5 bp600:px-6 bp1200:px-8">
        <div
          className={cn(
            "flex flex-col items-center gap-5 text-center",
            "bp600:flex-row bp600:items-center bp600:justify-between bp600:text-left",
          )}
        >
          <Link href={homeHref} aria-label="APrly home">
            <AuthBrandLogo size="header" className="!text-white [&_span]:!text-white" useImage={false} />
          </Link>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary-theme-400)] bp600:justify-end bp600:text-sm"
            aria-label="Footer"
          >
            <Link href={termsLink.href} className="transition-opacity hover:opacity-80">
              {termsLink.label}
            </Link>
            <span className="text-[var(--primary-theme-400)] bp600:hidden" aria-hidden>
              |
            </span>
            <span className="hidden text-[var(--primary-theme-400)] bp600:inline" aria-hidden>
              /
            </span>
            <Link href={privacyLink.href} className="transition-opacity hover:opacity-80">
              {privacyLink.label}
            </Link>
          </nav>
        </div>

        <div className="my-5 border-t border-white/10" aria-hidden />

        <div
          className={cn(
            "flex flex-col items-center gap-5 text-center",
            "bp600:flex-row bp600:items-center bp600:justify-between bp600:text-left",
          )}
        >
          <div className="order-1 flex flex-col items-center gap-4 bp600:order-2 bp600:items-end">
            <img
              src={sharedAsset("plaid-logo-footer.png")}
              alt="Plaid verified"
              className="h-8 w-auto"
            />
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
          </div>
          <p className="order-2 text-xs text-white/70 bp600:order-1 bp600:text-sm">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
