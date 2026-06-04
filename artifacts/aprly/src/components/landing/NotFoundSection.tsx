import { Link } from "wouter";
import { Button } from "@/components/ui/button";
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

      <h1
        id="not-found-title"
        className={cn(
          "mt-8 max-w-lg text-xl font-extrabold uppercase leading-tight tracking-tight text-[var(--neutral-theme-900)]",
          "bp600:mt-10 bp600:text-2xl",
          "bp840:text-3xl",
          "bp1200:text-[2rem]",
        )}
      >
        {notFoundContent.title}
      </h1>

      <p
        className={cn(
          "mt-3 max-w-md text-sm text-[var(--hint-text-color)]",
          "bp600:mt-4 bp600:text-base",
        )}
      >
        {notFoundContent.subtitle}
      </p>

      <Button
        type="button"
        className={cn(
          "mt-8 min-w-[160px] font-bold uppercase tracking-wide",
          "w-full max-w-xs bp600:w-auto",
        )}
        asChild
      >
        <Link href={notFoundContent.ctaHref}>{notFoundContent.cta}</Link>
      </Button>
    </section>
  );
}
