import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { AuthBrandLogo } from "@/components/auth/AuthBrandLogo";
import { PillButton } from "@/components/shared/PillButton";
import { brandContent } from "@/content/landing";
import { navContent } from "@/content/landings/green";
import { sharedAsset } from "@/lib/shared-assets";
import { cn } from "@/lib/utils";

export type LandingHeaderProps = {
  onGetStarted: () => void;
  onNavigateAnchor: (href: string) => void;
};

const WIDE_HEADER_MQ = "(min-width: 600px)";

function useWideHeaderLayout(): boolean {
  const [wide, setWide] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia(WIDE_HEADER_MQ).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(WIDE_HEADER_MQ);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return wide;
}

type LandingHeaderActionsProps = {
  onGetStarted: () => void;
  layout: "inline" | "mobile-row";
  onActionClick?: () => void;
};

function LandingHeaderActions({
  onGetStarted,
  layout,
  onActionClick,
}: LandingHeaderActionsProps) {
  const wrap = (node: ReactNode) => {
    if (layout === "mobile-row") {
      return (
        <div className="flex w-full max-w-md items-center justify-center gap-3">{node}</div>
      );
    }
    return <div className="flex items-center gap-2 bp600:gap-3">{node}</div>;
  };

  return wrap(
    <>
      <PillButton
        variant="ghost"
        size="default"
        className={cn(
          "w-[86px] min-w-[86px] px-0",
          layout === "mobile-row" && "h-12 min-h-12 flex-1",
        )}
        asChild
      >
        <Link href={navContent.logIn.href} onClick={onActionClick}>
          {navContent.logIn.label}
        </Link>
      </PillButton>
      <PillButton
        variant="primary"
        size="lg"
        type="button"
        className={cn(layout === "mobile-row" && "h-12 min-h-12 flex-1")}
        onClick={() => {
          onActionClick?.();
          onGetStarted();
        }}
      >
        {navContent.getStarted.label}
      </PillButton>
    </>,
  );
}

type NavLinksListProps = {
  className?: string;
  linkClassName?: string;
  onSelect: (href: string) => void;
};

function NavLinksList({ className, linkClassName, onSelect }: NavLinksListProps) {
  return (
    <ul className={className}>
      {navContent.links.map((link) => (
        <li key={link.id}>
          <button
            type="button"
            className={cn(
              "app-button-button-l-m text-[var(--action-default-color)] transition-opacity hover:opacity-80",
              linkClassName,
            )}
            onClick={() => onSelect(link.href)}
          >
            {link.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

type LandingNavDropdownProps = {
  onSelect: (href: string) => void;
};

function LandingNavDropdown({ onSelect }: LandingNavDropdownProps) {
  return (
    <div
      className={cn(
        "absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[260px] rounded-2xl",
        "border border-[var(--neutral-theme-200)] bg-white px-5 py-4 shadow-lg",
      )}
      role="menu"
    >
      <NavLinksList
        className="flex flex-col gap-4"
        linkClassName="w-full text-left text-sm tracking-wide"
        onSelect={onSelect}
      />
    </div>
  );
}

type LandingNavOverlayProps = {
  onClose: () => void;
  onGetStarted: () => void;
  onSelect: (href: string) => void;
};

function LandingNavOverlay({ onClose, onGetStarted, onSelect }: LandingNavOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-[var(--page-bg)]"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="mx-auto flex h-full w-full max-w-[1600px] flex-col px-4 pb-8 pt-4 bp600:px-6 bp1200:px-8"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="shrink-0"
            aria-label={`${brandContent.name} home`}
            onClick={onClose}
          >
            <AuthBrandLogo size="header" className="!text-left" />
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-2xl font-bold leading-none text-[var(--primary-theme-500)] transition-opacity hover:opacity-80"
            aria-label="Close menu"
            onClick={onClose}
          >
            <span aria-hidden>×</span>
          </button>
        </div>

        <nav className="flex flex-1 flex-col items-center justify-center" aria-label="Primary">
          <NavLinksList
            className="flex flex-col items-center gap-6 text-center"
            linkClassName="text-base tracking-wide bp840:text-lg"
            onSelect={onSelect}
          />
        </nav>

        <div className="flex items-center justify-center gap-3">
          <PillButton variant="ghost" size="default" className="h-12 min-h-12 flex-1 max-w-[200px]" asChild>
            <Link href={navContent.logIn.href} onClick={onClose}>
              {navContent.logIn.label}
            </Link>
          </PillButton>
          <PillButton
            variant="primary"
            size="lg"
            type="button"
            className="h-12 min-h-12 flex-1 max-w-[200px]"
            onClick={() => {
              onClose();
              onGetStarted();
            }}
          >
            {navContent.getStarted.label}
          </PillButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function LandingHeader({ onGetStarted, onNavigateAnchor }: LandingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isWideLayout = useWideHeaderLayout();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const onNavSelect = useCallback(
    (href: string) => {
      closeMenu();
      onNavigateAnchor(href);
    },
    [closeMenu, onNavigateAnchor],
  );

  useEffect(() => {
    if (!menuOpen || !isWideLayout) return undefined;

    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, isWideLayout, closeMenu]);

  useEffect(() => {
    if (!menuOpen || isWideLayout) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, isWideLayout, closeMenu]);

  const hasNavLinks = navContent.links.length > 0;
  const menuId = "landing-header-nav-menu";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-[var(--neutral-theme-200)]",
          "bg-[var(--header-bg-color)] backdrop-blur supports-[backdrop-filter]:bg-[var(--page-bg)]/90",
        )}
      >
        <div className="mx-auto w-full max-w-[1600px] px-4 bp600:px-6 bp1200:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link href="/" className="shrink-0" aria-label={`${brandContent.name} home`}>
              <AuthBrandLogo size="header" className="!text-left" />
            </Link>

            <div className="flex shrink-0 items-center gap-2 bp600:gap-3">
              <div className="hidden bp600:flex">
                <LandingHeaderActions onGetStarted={onGetStarted} layout="inline" />
              </div>

              {hasNavLinks ? (
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                    aria-controls={menuId}
                    onClick={() => setMenuOpen((open) => !open)}
                  >
                    <img
                      src={sharedAsset("menu-button.svg")}
                      alt=""
                      className="h-6 w-6 object-contain"
                      aria-hidden
                    />
                  </button>

                  {menuOpen && isWideLayout ? (
                    <div id={menuId}>
                      <LandingNavDropdown onSelect={onNavSelect} />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-center pb-4 bp600:hidden">
            <LandingHeaderActions onGetStarted={onGetStarted} layout="mobile-row" />
          </div>
        </div>
      </header>

      {menuOpen && !isWideLayout && hasNavLinks ? (
        <LandingNavOverlay
          onClose={closeMenu}
          onGetStarted={onGetStarted}
          onSelect={onNavSelect}
        />
      ) : null}
    </>
  );
}
