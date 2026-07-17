import { Link } from "wouter";
import { PillButton } from "@/components/shared/PillButton";
import { notFoundContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";

type NotFoundSectionProps = {
  className?: string;
};

export function NotFoundSection({ className }: NotFoundSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-4 py-12 text-center",
        "bp600:px-6 bp600:py-16",
        "bp840:py-20",
        "bp1200:py-24",
        className,
      )}
      aria-labelledby="not-found-title"
    >
      <img
        src={landingAsset("landing/404/search.png")}
        alt={notFoundContent.imageAlt}
        className={cn(
          "h-auto w-[200px] max-w-full object-contain",
          "bp600:w-[240px]",
          "bp840:w-[280px]",
          "bp1200:w-[300px]",
        )}
        width={300}
        height={300}
        decoding="async"
      />

      <h1 id="not-found-title" className="app-header-h6 text-title mt-8 bp600:mt-10">
        {notFoundContent.title}
      </h1>

      <p className="app-text-p1-regular text-average mt-3 max-w-md bp600:mt-4">
        {notFoundContent.subtitle}
      </p>

      <PillButton
        type="button"
        variant="primary"
        className="mt-8 h-[52px] w-[173px]"
        asChild
      >
        <Link href={notFoundContent.ctaHref}>{notFoundContent.cta}</Link>
      </PillButton>
    </section>
  );
}
