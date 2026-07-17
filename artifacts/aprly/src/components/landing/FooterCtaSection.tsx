import { footerContent } from "@/content/landing";
import { LandingFooter } from "./LandingFooter";

type FooterCtaSectionProps = {
  onAuditClick?: () => void;
  ctaLabel?: string;
  title?: string;
};

/**
 * @deprecated White-green design uses only the unified bottom footer.
 * Kept so old imports still render the site footer (CTA band removed).
 */
export function FooterCtaSection(_props: FooterCtaSectionProps) {
  const copyright = footerContent.copyrightTemplate.replace(
    "{year}",
    String(new Date().getFullYear()),
  );
  return <LandingFooter copyright={copyright} />;
}
