import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Link } from "wouter";
import { brandContent, footerContent } from "@/content/landing";
import { cn } from "@/lib/utils";

const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
} as const;

type LandingFooterProps = {
  copyright: string;
  /** Logo link target (cabinet uses dashboard home). */
  homeHref?: string;
};

export function LandingFooter({ copyright, homeHref = "/" }: LandingFooterProps) {
  const [termsLink, privacyLink] = footerContent.links;

  return (
    <footer className="bg-[var(--footer-bg-color)] text-white">
      <div className="box-border w-full max-w-none px-[20px] py-[20px]">
        <div
          className={cn(
            "flex flex-col items-center gap-5 text-center",
            "bp600:flex-row bp600:items-center bp600:justify-between bp600:text-left",
          )}
        >
          <Link
            href={homeHref}
            className="text-2xl font-black tracking-tight text-white/95 transition-opacity hover:opacity-90 bp600:text-3xl"
            aria-label="APRly home"
          >
            {brandContent.name}
          </Link>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-2 text-xs font-semibold uppercase tracking-wide text-[var(--info-theme-500)] bp600:justify-end bp600:text-sm"
            aria-label="Footer"
          >
            <Link
              href={termsLink.href}
              className="transition-opacity hover:opacity-80"
            >
              {termsLink.label}
            </Link>
            <span className="text-[var(--info-theme-500)] bp600:hidden" aria-hidden>
              |
            </span>
            <span
              className="hidden text-[var(--info-theme-500)] bp600:inline"
              aria-hidden
            >
              /
            </span>
            <Link
              href={privacyLink.href}
              className="transition-opacity hover:opacity-80"
            >
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
          <div className="order-1 flex items-center gap-5 bp600:order-2">
            {footerContent.social.map((item) => {
              const Icon = SOCIAL_ICONS[item.id as keyof typeof SOCIAL_ICONS];
              if (!Icon) return null;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="text-[var(--info-theme-500)] transition-opacity hover:opacity-80"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </a>
              );
            })}
          </div>
          <p className="order-2 text-xs text-white/70 bp600:order-1 bp600:text-sm">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
