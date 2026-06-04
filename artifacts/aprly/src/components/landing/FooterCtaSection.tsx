import { AuthBrandLogo } from "@/components/auth/AuthBrandLogo";
import { Button } from "@/components/ui/button";
import { planContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";

type FooterCtaSectionProps = {
  onAuditClick?: () => void;
  ctaLabel?: string;
  title?: string;
};

export function FooterCtaSection({
  onAuditClick,
  ctaLabel,
  title,
}: FooterCtaSectionProps) {
  return (
    <section
      id="plan"
      className={cn(
        "scroll-mt-24 relative overflow-hidden px-4",
        "min-h-[320px] py-16 bp600:min-h-[380px] bp600:py-20",
        "bp840:min-h-[420px] bp840:py-24",
        "bp1200:min-h-[480px] bp1200:py-28",
        "bp1600:min-h-[520px] bp1600:py-32",
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-[center_30%] bg-no-repeat bp840:bg-right bp840:bg-center"
        style={{
          backgroundImage: `url(${landingAsset("landing/footer-cta/bg-image.png")})`,
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#F8FCFE]/75" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#F8FCFE] to-transparent bp1200:h-32"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F8FCFE] to-transparent bp1200:h-32"
        aria-hidden
      />

      <div className="app-page-marketing relative flex min-h-[inherit] flex-col justify-center text-left">
        <AuthBrandLogo
          size="hero"
          className="!text-left text-3xl bp600:text-4xl bp1200:text-5xl"
        />
        <p
          className={cn(
            "mt-6 max-w-xl font-extrabold uppercase leading-tight tracking-tight text-[var(--primary-theme-900)]",
            "text-xl bp600:max-w-2xl bp600:text-2xl",
            "bp840:mt-8 bp840:max-w-2xl bp840:text-3xl",
            "bp1200:max-w-3xl bp1200:text-4xl",
            "bp1600:max-w-4xl",
          )}
        >
          {title ?? planContent.title}
        </p>
        <Button
          type="button"
          size="lg"
          className={cn(
            "mt-8 h-12 w-fit min-w-[200px] rounded-[var(--design-button-corner-radius,12px)]",
            "px-10 text-sm font-bold uppercase tracking-wide",
            "bp840:mt-10",
          )}
          onClick={() => onAuditClick?.()}
        >
          {ctaLabel ?? planContent.cta.label}
        </Button>
      </div>
    </section>
  );
}
